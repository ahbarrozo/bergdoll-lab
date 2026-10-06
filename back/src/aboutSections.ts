import { Hono } from 'hono';
import { Pool } from 'pg';
import { AppVariables } from './types/hono.types';
import { Image, ImageDTO } from './types/Image.type';
import { AboutSection, AboutSectionDTO } from './types/AboutSection.type';
import { authGuard } from './auth';

const aboutSections = new Hono<{ Variables: AppVariables }>();

/**
 *  GET all about section while joining all the images associated
 *  with them and ordering by post date. Then the result is
 *  parsed to include all images in a single array inside the
 *  images attribute.
 */
aboutSections.get('/', async (c) => {
    const pool: Pool = c.get('db');
    const query = c.req.query('locale');
    const andClause: string = query
        ? `AND im.locale = '${query}' `
        : '';
    const whereClause: string = query
        ? `WHERE asec.locale = '${query}'`
        : '';

    try {
        const result = await pool.query(`
            SELECT 
                asec.text, asec.locale, asec.id as id, asec.section_num, 
                im.id AS image_id, im.path AS image_path,
                im.title AS image_title, im.description AS image_description,
                im.locale AS image_locale 
            FROM 
                about_sections asec
            LEFT JOIN
                about_sections_images asi ON asec.id = asi.about_section_id
            LEFT JOIN
                images im ON asi.image_id = im.id ${andClause} 
            ${whereClause} 
            ORDER BY 
                asec.id;
        `);

        const aboutSections = result.rows.reduce((rows, row) => {
            const image: Image | null = row.image_id
                ? {
                    id: row.image_id,
                    description: row.image_description,
                    path: row.image_path,
                    title: row.image_title,
                    locale: row.image_locale
                }
                : null;

            const existingAboutSection: AboutSection = rows.find((r: AboutSection) => r.id === row.id);

            if (existingAboutSection) {
                if (image) existingAboutSection.images.push(image);
            } else {
                const aboutSection: AboutSection = {
                    id: row.id,
                    sectionNum: row.section_num,
                    text: row.text,
                    locale: row.locale,
                    images: []
                };

                if (image) aboutSection.images.push(image);

                rows.push(aboutSection);
            }
            return rows;
        }, []);

        return c.json(aboutSections, 200);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to fetch about_sections.' }, 500);
    }
});

/**
 *  POST request to create a new about section entry. It will insert the
 *  new rows at the about_sections, about_section_images and images tables
 */
aboutSections.post('/', authGuard, async (c) => {
    const pool: Pool = c.get('db');

    try {
        const data = await c.req.formData();
        const aboutSection: AboutSectionDTO = {
            sectionNum: parseInt(data.get('sectionNum')!.toString()),
            text: data.get('text')!.toString(),
            locale: data.get('locale')!.toString(),
        };

        const images: ImageDTO[] = JSON.parse(data.get('images')!.toString());

        const aboutSectionQuery = await pool.query(`
            INSERT INTO 
                about_sections (text, locale, section_num)
            VALUES 
                ($1, $2, $3) 
            RETURNING 
                id;`,
            [aboutSection.text, aboutSection.locale, aboutSection.sectionNum]
        );
        const aboutSectionId = aboutSectionQuery.rows[0].id;
        const resultImagesPromises = images.map(async (image) => {
            const resultImage = await pool.query(`
                INSERT INTO 
                    images (path, description, title, locale)
                VALUES 
                    ($1, $2, $3, $4)
                RETURNING 
                    id;`,
                [image.path, image.description, image.title, image.locale]
            );

            return resultImage.rows[0].id;
        });

        const resultImages = await Promise.all(resultImagesPromises);

        await Promise.all(
            resultImages.map(async (imageId) => {
                await pool.query(
                    `
                    INSERT INTO 
                        about_sections_images (about_section_id, image_id)
                    VALUES 
                        ($1, $2);`,
                    [aboutSectionId, imageId]
                );
            })
        );

        return c.json(resultImages, 201);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to insert new about section into DB' }, 500);
    }
});

/**
 *  PUT request to update a section and its translations based on its 
 *  ID. It will check its existence, fetch images associated with it, 
 *  and update all the fields available at the submission form, images 
 *  included, if needed
 */
aboutSections.put('/:id', authGuard, async (c) => {
    const pool: Pool = c.get('db');
    const id = c.req.param('id');
    const data = await c.req.formData();
    const aboutSection: AboutSectionDTO = {
        text: data.get('text')!.toString(),
        locale: data.get('locale')!.toString()
    };

    const images: ImageDTO[] = JSON.parse(data.get('images')!.toString());

    try {
        const checkAboutSection = await pool.query(
            `
            SELECT 
                id 
            FROM 
                about_sections
            WHERE 
                id = $1;`,
            [id]
        );

        if (checkAboutSection.rows.length === 0) {
            return c.json({ error: 'About section not found' }, 404);
        }

        await pool.query(`
            UPDATE 
                about_sections
            SET 
                text = $1, locale = $2
            WHERE 
                id = $3;`,
            [aboutSection.text, aboutSection.locale, id]
        );

        const aboutSectionsImagesResults = await pool.query(
            `
            SELECT 
                asi.image_id, asi.about_section_id 
            FROM 
                about_sections_images asi
            WHERE 
                asi.about_section_id = $1;`,
            [id]
        );

        // separating between images to be deleted and upserted
        const imagesToDelete = aboutSectionsImagesResults.rows.filter(
            (im) => !images.map((i) => i.id).includes(im.image_id)
        );
        const imagesToUpsert = images.filter(
            (im) => !im.id || !imagesToDelete.map((i) => i.id).includes(im.id)
        );

        await Promise.all(
            imagesToDelete.map(async (im) => {
                await pool.query(`
                    DELETE FROM 
                        about_sections_images 
                    WHERE 
                        about_section_id = $1
                    AND
                        image_id = $2`,
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
                            about_sections_images (about_section_id, image_id) 
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

        return c.json({ message: `About section ${id} updated successfully` }, 200);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to insert new about section into DB' }, 500);
    }
});

// DELETE request to delete a section in bio
aboutSections.delete('/:id', authGuard, async (c) => {
    const pool: Pool = c.get('db');
    const id = c.req.param('id');

    try {
        const checkAboutSection = await pool.query(`
            SELECT 
                id 
            FROM 
                about_sections 
            WHERE 
                id = $1;`,
            [id]
        );

        if (checkAboutSection.rows.length === 0) {
            return c.json({ error: 'About section not found' }, 404);
        }

        const checkAboutSectionImages = await pool.query(`
            SELECT 
                about_section_id 
            FROM 
                about_sections_images 
            WHERE 
                about_section_id = $1;`,
            [id]
        );

        if (checkAboutSectionImages.rows.length > 0) {
            await pool.query(`
                DELETE FROM 
                    about_sections_images 
                WHERE 
                    about_section_id = $1`,
                [id]
            );
        }


        await pool.query(`
            DELETE FROM 
                about_sections
            WHERE 
                id = $1`,
            [id]
        );

        return c.json(
            {
                message: 'About section deleted successfully',
                id
            },
            200
        );
    } catch (error) {
        console.error('Error deleting about section: ', error);
        return c.json({ error: 'Failed to delete about section' }, 500);
    }
});

export default aboutSections;
