import { Hono } from 'hono';
import { Pool } from 'pg';
import { AppVariables } from './types/hono.types';
import { BlogComment, BlogCommentDTO } from './types/BlogComment.type';
import { authGuard } from './auth';

const blogComments = new Hono<{ Variables: AppVariables }>();

/**
 *  GET all comments
 */
blogComments.get('/', async (c) => {
    const pool: Pool = c.get('db');

    try {
        const result = await pool.query(`
            SELECT 
                bc.id, bc.date, bc.author, bc.text, bc.blog_post_id 
            FROM 
                blog_comments bc
            ORDER BY
                bc.date;
        `);

        return c.json(result.rows, 200);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to fetch blog_comments.' }, 500);
    }
});

/**
 *  GET all comments
 */
blogComments.get('/:id', async (c) => {
    const pool: Pool = c.get('db');
    const id = c.req.param('id');

    try {
        const result = await pool.query(`
            SELECT 
                bc.id, bc.date, bc.author, bc.text, bc.blog_post_id 
            FROM 
                blog_comments bc 
            WHERE
                bc.blog_post_id = $1 
            ORDER BY
                bc.date;
        `, [id]);

        return c.json(result.rows, 200);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to fetch blog_comments.' }, 500);
    }
});

/**
 *  POST request to create a new blog comment. It will insert the
 *  new rows in the blog_comments tables
 */
blogComments.post('/:id', async (c) => {
    const pool: Pool = c.get('db');
    const id = c.req.param('id');

    try {
        const data = await c.req.formData();
        const blogComment: BlogCommentDTO = {
            author: data.get('author')!.toString(),
            text: data.get('text')!.toString(),
        };

        const result = await pool.query(`
            INSERT INTO 
                blog_comments (author, text, blog_post_id) 
            VALUES 
                ($1, $2, $3)
            RETURNING 
                id;`,
            [blogComment.author, blogComment.text, id]);

        return c.json(result.rows[0], 201);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to insert new blog content into DB' }, 500);
    }
});

/**
 *  PUT request to update a blog comment entry based on its ID. It will
 *  check its existence, fetch images associated with it, and update
 *  all the fields available at the submission form, images included,
 *  if needed
 */
blogComments.put('/:id', async (c) => {
    const pool: Pool = c.get('db');
    const id = c.req.param('id');
    const data = await c.req.formData();
    const blogComment: BlogCommentDTO = {
        author: data.get('title')!.toString(),
        date: data.get('date')!.toString(),
        text: data.get('text')!.toString()
    };

    try {
        const checkBlogComment = await pool.query(`
            SELECT 
                id 
            FROM 
                blog_comments
            WHERE 
                id = $1;`,
            [id]
        );

        if (checkBlogComment.rows.length === 0) {
            return c.json({ error: 'Blog comment not found' }, 404);
        }

        await pool.query(`
            UPDATE 
                blog_comments
            SET 
                author = $1, date = $2, text = $3 
            WHERE 
                id = $4;`,
            [blogComment.author, blogComment.date, blogComment.text, id]
        );

        return c.json({ message: `Blog comment ${id} updated successfully` }, 200);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to update blog comment into DB' }, 500);
    }
});

blogComments.delete('/:id', authGuard, async (c) => {
    const pool: Pool = c.get('db');
    const id = c.req.param('id');

    try {
        const checkBlogComment = await pool.query(`
            SELECT 
                id 
            FROM 
                blog_comments 
            WHERE 
                id = $1;`,
            [id]
        );

        if (checkBlogComment.rows.length === 0) {
            return c.json({ error: 'Blog comment not found' }, 404);
        }

        await pool.query(`
            DELETE FROM 
                blog_comments 
            WHERE 
                id = $1`,
            [id]
        );

        return c.json(
            {
                message: 'Blog comment deleted successfully',
                id
            },
            200
        );
    } catch (error) {
        console.error('Error deleting blog comment: ', error);
        return c.json({ error: 'Failed to delete blog comment' }, 500);
    }
});

export default blogComments;
