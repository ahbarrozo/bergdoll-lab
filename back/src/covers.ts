import { Hono } from 'hono';
import { Pool } from 'pg';
import { AppVariables } from './types/hono.types';
import { ImageDTO } from './types/Image.type';
import { authGuard } from './auth';

const covers = new Hono<{ Variables: AppVariables }>();

/**
 *  GET all cover while joining all the images associated
 *  with them and ordering by post date. Then the result is
 *  parsed to include all images in a single array inside the
 *  images attribute.
 */
covers.get('/', async (c) => {
	const pool: Pool = c.get('db');
	const query = c.req.query('locale');
	const whereClause: string = query
		? `WHERE covers.locale = '${query}'`
		: '';
	try {
		const result = await pool.query(`
            SELECT 
                id, title, path, locale    
            FROM 
                covers 
			${whereClause};
        `);

		const covers = result.rows;

		return c.json(covers, 200);
	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to fetch cover.' }, 500);
	}
});

/**
 *  POST request to create a new work entry. It will insert the
 *  new rows at the cover, work_images and images tables
 */
covers.post('/', authGuard, async (c) => {
	const pool: Pool = c.get('db');

	try {
		const data = await c.req.formData();
    	const image: ImageDTO = {
            description: data.get('description')! && data.get('description')!.toString(),
			path: data.get('path')!.toString(),
			title: data.get('title')!.toString(),
			locale: data.get('locale')!.toString()
		};
		await pool.query(`
            INSERT INTO 
                covers (path, title, description, locale)
			VALUES
				($1, $2, $3, $4)
            RETURNING 
                id;`,
			[image.path ,image.title, image.description, image.locale]
		);

		return c.json({ message: `Cover created successfully` }, 201);
	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to insert new cover into DB' }, 500);
	}
});

/**
 *  PUT request to update an work based on its ID. It will
 *  check its existence, fetch images associated with it, and update
 *  all the fields available at the submission form, images included,
 *  if needed
 */
covers.put('/:id', authGuard, async (c) => {
	const pool: Pool = c.get('db');
	const id = c.req.param('id');
	const data = await c.req.formData();

	const image: ImageDTO = {
            description: data.get('description')! && data.get('description')!.toString(),
			path: data.get('path')!.toString(),
			title: data.get('title')!.toString(),
			locale: data.get('locale')!.toString()
		};
	try {
		const checkCover = await pool.query(
			`
            SELECT 
                id 
            FROM 
                covers 
            WHERE 
                id = $1;`,
			[id]
		);

		if (checkCover.rows.length === 0) {
			return c.json({ error: 'Cover not found' }, 404);
		}

		await pool.query(`
            UPDATE 
                covers 
            SET 
                path = $1, title = $2, locale = $3 
            WHERE 
                id = $4;`,
			[image.path, image.title, image.locale, id]
		);
		return c.json({ message: `Cover ${id} updated successfully` }, 200);
	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to insert new work into DB' }, 500);
	}
});

// DELETE request to delete a cover based on its ID
covers.delete('/:id', authGuard, async (c) => {
	const pool: Pool = c.get('db');
	const id = c.req.param('id');

	try {
		const checkCover = await pool.query(`
            SELECT 
				id 
			FROM 
				cover 
			WHERE 
				id = $1;`,
			[id]
		);

		if (checkCover.rows.length === 0) {
			return c.json({ error: 'Cover not found' }, 404);
		}

		await pool.query(`
            DELETE FROM 
				covers
			WHERE 
				id = $1`,
			[id]
		);

		return c.json(
			{
				message: 'Cover deleted successfully',
				id
			},
			200
		);
	} catch (error) {
		console.error('Error deleting work: ', error);
		return c.json({ error: 'Failed to delete work' }, 500);
	}
});

export default covers;
