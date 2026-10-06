import { Hono } from 'hono';
import { Pool } from 'pg';
import { AppVariables } from './types/hono.types';
import { Image, ImageDTO } from './types/Image.type';
import { Person, PersonDTO } from './types/Person.type';
import { authGuard } from './auth';

const people = new Hono<{ Variables: AppVariables }>();

/**
 *  GET all works while joining all the images associated

 *  with them and ordering by post date. Then the result is
 *  parsed to include all images in a single array inside the
 *  images attribute.
 */
people.get('/', async (c) => {

	const pool: Pool = c.get('db');
	const query = c.req.query('locale');
	const andClause: string = query
		? `AND im.locale = '${query}' `
		: '';
	const whereClause: string = query
		? `WHERE pp.locale = '${query}'`
		: '';
	try {
		const result = await pool.query(`
            SELECT 
                pp.id, pp.date, pp.title, pp.link, 
				pp.description, pp.locale,    
                im.id AS image_id, im.path AS image_path,
                im.title AS image_title, im.description AS image_description,
				im.locale AS image_locale
            FROM 
                people pp 

            LEFT JOIN
                people_images ppi ON pp.id = ppi.work_id
            LEFT JOIN
                images im ON ppi.image_id = im.id ${andClause}
			${whereClause}
			ORDER BY 
				pp.date
			DESC;
        `);

		const people = result.rows.reduce((rows, row) => {

			const image: Image | null = row.image_id
				? {
					id: row.image_id,
					description: row.image_description,
					path: row.image_path,
					title: row.image_title,
					locale: row.image_locale
				}
				: null;

			const existingPerson: Person = rows.find((r: Person) => r.id === row.id);

			if (existingPerson) {
				if (image) existingPerson.images.push(image);
			} else {
				const person: Person = {
					id: row.id,
					date: row.date,
					description: row.description,
					link: row.link,
					title: row.title,
					locale: row.locale,
					images: []
				};

				if (image) person.images.push(image);

				rows.push(person);
			}
			return rows;
		}, []);

		return c.json(people, 200);

	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to fetch people.' }, 500);

	}
});

/**
 *  POST request to create a new work entry. It will insert the
 *  new rows at the people, work_images and images tables

 */
people.post('/', authGuard, async (c) => {

	const pool: Pool = c.get('db');

	try {
		const data = await c.req.formData();
		const person: PersonDTO = {
			date: data.get('date')!.toString(),
			description: data.get('description')!.toString(),
			link: data.get('link')! && data.get('link')!.toString(), // nullable field
			title: data.get('title')!.toString(),
			locale: data.get('locale')!.toString()
		};
		const images: ImageDTO[] = JSON.parse(data.get('images')!.toString());

		const personQuery = await pool.query(`
            INSERT INTO 
                people (date, link, title, description, locale)

			VALUES
				($1, $2, $3, $4, $5)
            RETURNING 
                id;`,
			[person.date, person.link, person.title, person.description, person.locale]
		);
		const personId = personQuery.rows[0].id;
		const resultImagesPromises = images.map(async (image) => {
			const resultImages = await pool.query(
				`
                INSERT INTO 
                    images (path, description, title, locale)
                VALUES 
                    ($1, $2, $3, $4)
                RETURNING 
                    id;`,
				[image.path, image.description, image.title, image.locale]
			);

			return resultImages.rows[0].id;
		});

		const resultImages = await Promise.all(resultImagesPromises);

		await Promise.all(
			resultImages.map(async (imageId) => {
				await pool.query(
					`
					INSERT INTO 
						people_images (person_id, image_id)
					VALUES 
						($1, $2);`,
					[personId, imageId]
				);
			})
		);

		return c.json(resultImages, 201);
	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to insert new person into DB' }, 500);
	}
});

/**
 *  PUT request to update an work based on its ID. It will
 *  check its existence, fetch images associated with it, and update
 *  all the fields available at the submission form, images included,
 *  if needed
 */
people.put('/:id', authGuard, async (c) => {

	const pool: Pool = c.get('db');
	const id = c.req.param('id');
	const data = await c.req.formData();
	const person: PersonDTO = {
		date: data.get('date')!.toString(),
		description: data.get('description')!.toString(),
		link: data.get('link')! && data.get('link')!.toString(),
		title: data.get('title')!.toString(),
		locale: data.get('locale')!.toString()
	};

	const images: ImageDTO[] = JSON.parse(data.get('images')!.toString());

	try {
		const checkPerson = await pool.query(
			`
            SELECT 
                id 
            FROM 
                people 

            WHERE 
                id = $1;`,
			[id]
		);

		if (checkPerson.rows.length === 0) {
			return c.json({ error: 'Work not found' }, 404);
		}

		await pool.query(`
            UPDATE 
                people 

            SET 
                date = $1, link = $2, title = $3 
            WHERE 
                id = $4;`,
			[person.date, person.link, person.title, id]
		);

		const peopleImagesResults = await pool.query(`
            SELECT 
                ppi.image_id, ppi.work_id 
            FROM 
                people_images ppi
            WHERE 
                ppi.work_id = $1;`,
			[id]
		);

		// separating between images to be deleted and upserted
		const imagesToDelete = peopleImagesResults.rows.filter(
			(im) => !images.map((i) => i.id).includes(im.image_id)
		);
		const imagesToUpsert = images.filter(
			(im) => !im.id || !imagesToDelete.map((i) => i.id).includes(im.id)
		);

		await Promise.all(
			imagesToDelete.map(async (im) => {
				await pool.query(`
					DELETE FROM 
						people_images 
					WHERE 
						person_id = $1 AND image_id = $2`,
					[id, im.image_id]);
			})
		);

		// Check among images to insert if for no given ID. Else, update
		await Promise.all(
			imagesToUpsert.map(async (image) => {
				if (!image.id) {
					const result = await pool.query(`
                        INSERT INTO 
                            images (path, description, title, locale)
                        VALUES 
                            ($1, $2, $3, $4)
                        RETURNING 
                            id;`,
						[image.path, image.description, image.title, image.locale]
					);

					await pool.query(`
                        INSERT INTO 
                            people_images (person_id, image_id) 
                        VALUES
                            ($1, $2);`,
						[id, result.rows[0].id]
					);
				} else {
					await pool.query(`
                        UPDATE 
                            images 
                        SET 
                            path = $1, description = $2, title = $3, locale = $4   
                        WHERE 
                            id = $5;`,
						[image.path, image.description, image.title, image.locale, image.id]
					);
				}

			})
		);

		return c.json({ message: `Person ${id} updated successfully` }, 200);
	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to insert new person into DB' }, 500);
	}
});

// DELETE request to delete a work based on its ID
people.delete('/:id', authGuard, async (c) => {

	const pool: Pool = c.get('db');
	const id = c.req.param('id');

	try {
		const checkPerson = await pool.query(`
            SELECT 
				id 
			FROM 
				people 

			WHERE 
				id = $1;`,
			[id]
		);

		if (checkPerson.rows.length === 0) {
			return c.json({ error: 'Person not found' }, 404);
		}

		const checkPersonImages = await pool.query(`
            SELECT 
				person_id 
			FROM 
				people_images 
			WHERE 
				person_id = $1;`,
			[id]
		);

		if (checkPersonImages.rows.length > 0) {
			await pool.query(`
                DELETE FROM 
					people_images 
				WHERE 
					person_id = $1`,
				[id]
			);
		}

		await pool.query(`
            DELETE FROM 
				people 

			WHERE 
				id = $1`,
			[id]
		);

		return c.json(
			{
				message: 'Work deleted successfully',
				id
			},
			200
		);
	} catch (error) {
		console.error('Error deleting work: ', error);
		return c.json({ error: 'Failed to delete work' }, 500);
	}
});

export default people;

