import { Hono } from 'hono';
import { Pool } from 'pg';
import { AppVariables } from './types/hono.types';
import { BlogPostTypeDTO } from './types/BlogPostType.types';
import { authGuard } from './auth';

const blogPostTypes = new Hono<{ Variables: AppVariables }>();

/**
 *  GET all blog post types rows.
 */
blogPostTypes.get('/', async (c) => {
	const pool: Pool = c.get('db');

	try {
		const result = await pool.query(`
            SELECT * FROM blog_post_types;
        `);

		return c.json(result.rows, 200);
	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to fetch Blog Post Types.' }, 500);
	}
});

/**
 *  POST request to create a new blog post type entry.
 */
blogPostTypes.post('/', authGuard, async (c) => {
	const pool: Pool = c.get('db');

	try {
		const data = await c.req.formData();
		const blogPostTypeDTO: BlogPostTypeDTO = {
			color: data.get('color')!.toString(),
			// Switch first letters to uppercase 
			display_name: data.get('display_name')!.toString().replace(/\b\w/g, (c) => c.toUpperCase()),
			name: data.get('name')!.toString().toLowerCase()
		};
		const result = await pool.query(
			`
            INSERT INTO 
                blog_post_types (color, display_name, name)
            VALUES 
                ($1, $2, $3)
            RETURNING 
                id;`,
			[blogPostTypeDTO.color, blogPostTypeDTO.display_name, blogPostTypeDTO.name]
		);

		return c.json({ message: `Blog Post Type ${result.rows[0].id} created successfully.` }, 201);
	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to insert new Blog Post Type into DB' }, 500);
	}
});

/**
 *  PUT request to update a blog post type based on its ID. It will
 *  check its existence, and update all the fields available at the
 *  submission form
 */
blogPostTypes.put('/:id', authGuard, async (c) => {
	const pool: Pool = c.get('db');
	const id = c.req.param('id');

	try {
		const checkBlogPostType = await pool.query(
			`
            SELECT 
                id 
            FROM 
                blog_post_types 
            WHERE 
                id = $1;`,
			[id]
		);

		if (checkBlogPostType.rows.length === 0) {
			return c.json({ error: 'Blog Post Type not found' }, 404);
		}

		const data = await c.req.formData();
		const blogPostTypeDTO: BlogPostTypeDTO = {
			color: data.get('color')!.toString(),
			display_name: data.get('display_name')!.toString().replace(/\b\w/g, (c) => c.toUpperCase()),
			name: data.get('name')!.toString().toLowerCase()
		};

		await pool.query(
			`
            UPDATE 
                blog_post_types 
            SET 
                color = $1, display_name = $2, name = $3 
            WHERE 
                id = $4 
            RETURNING 
                id;`,
			[blogPostTypeDTO.color, blogPostTypeDTO.display_name, blogPostTypeDTO.name, id]
		);

		return c.json({ message: `Blog Post Type ${id} updated successfully` }, 200);
	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to insert new Blog Post Type into DB' }, 500);
	}
});

/**
 *  DELETE request to delete a blog post type entry based
 *  on its ID
 */
blogPostTypes.delete('/:id', authGuard, async (c) => {
	const pool: Pool = c.get('db');
	const id = c.req.param('id');

	try {
		const checkBlogPostType = await pool.query(
			`
            SELECT id FROM blog_post_types WHERE id = $1;`,
			[id]
		);

		if (checkBlogPostType.rows.length === 0) {
			return c.json({ error: 'Blog Post Type not found' }, 404);
		}

		await pool.query(
			`
            DELETE FROM blog_post_types WHERE id = $1 RETURNING id`,
			[id]
		);

		return c.json({ message: 'Blog Post Type deleted successfully' }, 200);
	} catch (error) {
		console.error('Error deleting social Media: ', error);
		return c.json({ error: 'Failed to delete Blog Post Type' }, 500);
	}
});

export default blogPostTypes;
