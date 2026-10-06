import { Hono } from 'hono';
import { Pool } from 'pg';
import { AppVariables } from './types/hono.types';
import { Image, ImageDTO } from './types/Image.type';
import { BlogPost, BlogPostDTO } from './types/BlogPost.type';
import { authGuard } from './auth';
import { Document, DocumentDTO } from './types/Document.types';
import { Audio, AudioDTO } from './types/Audio.types';

const blogPosts = new Hono<{ Variables: AppVariables }>();

/**
 *  GET all blog posts while joining all the images associated
 *  with them and ordering by post date. A locale query is possible
 *  to filter results based on the locale. Then the result is
 *  parsed to include all images in a single array inside the
 *  images attribute.
 */
blogPosts.get('/', async (c) => {
    const pool: Pool = c.get('db');
    const query = c.req.query('locale');
    const andClauseImage: string = query
        ? `AND im.locale = '${query}' `
        : '';
    const andClauseDocument: string = query
        ? `AND d.locale = '${query}' `
        : '';
    const andClauseAudio: string = query
        ? `AND a.locale = '${query}' `
        : '';
    const whereClause: string = query
        ? `WHERE bp.locale = '${query}'`
        : '';

    try {
        const result = await pool.query(`
            SELECT 
                bp.id, bp.date, bp.title, bp.subtitle, 
                bp.text, bp.type, bp.locale, bp.post_num,
                im.id AS image_id, im.path AS image_path,
                im.title AS image_title, im.locale AS image_locale, 
                im.description AS image_description,  
                d.id AS document_id, d.path AS document_path,
                d.title AS document_title, d.locale AS document_locale, 
                d.description AS document_description,
                a.id AS audio_id, a.path AS audio_path,
                a.title AS audio_title, a.locale AS audio_locale, 
                a.description AS audio_description 
            FROM 
                blog_posts bp
            LEFT JOIN
                blog_posts_images bpi ON bp.id = bpi.blog_post_id
            LEFT JOIN
                images im ON bpi.image_id = im.id ${andClauseImage}
            LEFT JOIN
                blog_posts_audios bpa ON bp.id = bpa.blog_post_id
            LEFT JOIN
                audios a ON bpa.audio_id = a.id ${andClauseAudio}
            LEFT JOIN
                blog_posts_documents bpd ON bp.id = bpd.blog_post_id
            LEFT JOIN
                documents d ON bpd.document_id = d.id ${andClauseDocument}
            ${whereClause} 
            ORDER BY
                bp.date
            DESC;
        `);

        const blogPosts = result.rows.reduce((rows, row) => {
            const image: Image | null = row.image_id
                ? {
                    id: row.image_id,
                    description: row.image_description,
                    path: row.image_path,
                    title: row.image_title,
                    locale: row.image_locale
                }
                : null;
            const document: Document | null = row.document_id
                ? {
                    id: row.document_id,
                    description: row.document_description,
                    path: row.document_path,
                    title: row.document_title,
                    locale: row.document_locale
                }
                : null;
            const audio: Audio | null = row.audio_id
                ? {
                    id: row.audio_id,
                    description: row.audio_description,
                    path: row.audio_path,
                    title: row.audio_title,
                    locale: row.audio_locale
                }
                : null;

            const existingBlogPost: BlogPost = rows.find((r: BlogPost) => r.id === row.id);

            if (existingBlogPost) {

                // Add new images, documents and audios only if they were not present before
                if (image && !existingBlogPost.images.find((im: Image) => image.id === im.id))
                    existingBlogPost.images.push(image);
                if (document && !existingBlogPost.documents.find((d: Document) => document.id === d.id))
                    existingBlogPost.documents.push(document);
                if (audio && !existingBlogPost.audios.find((a: Audio) => audio.id === a.id))
                    existingBlogPost.audios.push(audio);
            } else {
                const blogPost: BlogPost = {
                    id: row.id,
                    postNum: row.post_num,
                    title: row.title,
                    subtitle: row.subtitle,
                    text: row.text,
                    date: row.date,
                    locale: row.locale,
                    type: row.type,
                    images: [],
                    documents: [],
                    audios: []
                };

                if (image) blogPost.images.push(image);
                if (document) blogPost.documents.push(document);
                if (audio) blogPost.audios.push(audio);

                rows.push(blogPost);
            }
            return rows;
        }, []);

        return c.json(blogPosts, 200);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to fetch blog_posts.' }, 500);
    }
});

/**
 *  POST request to create a new blog entry. It will insert the
 *  new rows at the blog_posts, blog_posts_images and images tables
 */
blogPosts.post('/', async (c) => {
    const pool: Pool = c.get('db');

    try {
        const data = await c.req.formData();
        const blogPost: BlogPostDTO = {
            postNum: parseInt(data.get('postNum')!.toString()),
            title: data.get('title')!.toString(),
            subtitle: data.get('subtitle')! && data.get('subtitle')!.toString(), // nullable field
            text: data.get('text')!.toString(),
            locale: data.get('locale')!.toString(),
            type: data.get('type')! && data.get('type')!.toString() // nullable field
        };

        const audios: AudioDTO[] = JSON.parse(data.get('audios')!.toString());
        const documents: DocumentDTO[] = JSON.parse(data.get('documents')!.toString());
        const images: ImageDTO[] = JSON.parse(data.get('images')!.toString());

        if (!blogPost.type) blogPost.type = 'other';

        const blogPostQuery = await pool.query(`
            INSERT INTO 
            blog_posts (title, subtitle, text, locale, post_num, type) 
            VALUES 
            ($1, $2, $3, $4, $5, $6)
            RETURNING 
            id;`,
            [blogPost.title, blogPost.subtitle, blogPost.text, blogPost.locale, blogPost.postNum, blogPost.type]);
        const blogPostId = blogPostQuery.rows[0].id;

        // Saving images
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
                await pool.query(`
                    INSERT INTO 
                        blog_posts_images (blog_post_id, image_id)
                    VALUES 
                        ($1, $2);`,
                    [blogPostId, imageId]
                );
            })
        );

        // Saving audios
        const resultAudiosPromises = audios.map(async (audio) => {
            const resultAudio = await pool.query(`
                INSERT INTO 
                    audios (path, description, title, locale)
                VALUES 
                    ($1, $2, $3, $4)
                RETURNING 
                    id;`,
                [audio.path, audio.description, audio.title, audio.locale]
            );

            return resultAudio.rows[0].id;
        });

        const resultAudios = await Promise.all(resultAudiosPromises);

        await Promise.all(
            resultAudios.map(async (audioId) => {
                await pool.query(`
                    INSERT INTO 
                        blog_posts_documents (blog_post_id, document_id)
                    VALUES 
                        ($1, $2);`,
                    [blogPostId, audioId]
                );
            })
        );

        // Saving documents
        const resultDocumentsPromises = documents.map(async (doc) => {
            const resultDocument = await pool.query(`
                INSERT INTO 
                    documents (path, description, title, locale)
                VALUES 
                    ($1, $2, $3, $4)
                RETURNING 
                    id;`,
                [doc.path, doc.description, doc.title, doc.locale]
            );

            return resultDocument.rows[0].id;
        });

        const resultDocuments = await Promise.all(resultDocumentsPromises);

        await Promise.all(
            resultDocuments.map(async (docId) => {
                await pool.query(`
                    INSERT INTO 
                        blog_posts_documents (blog_post_id, document_id)
                    VALUES 
                        ($1, $2);`,
                    [blogPostId, docId]
                );
            })
        );

        return c.json(resultImages, 201);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to insert new blog content into DB' }, 500);
    }
});

/**
 *  PUT request to update a blog entry based on its ID. It will
 *  check its existence, fetch images, audios and documents associated 
 *  with it, and update all the fields available at the submission form, 
 *  images included, if needed
 */
blogPosts.put('/:id', authGuard, async (c) => {
    const pool: Pool = c.get('db');
    const id = c.req.param('id');
    const data = await c.req.formData();
    const blogPost: BlogPostDTO = {
        title: data.get('title')!.toString(),
        subtitle: data.get('subtitle')! && data.get('subtitle')!.toString(), // nullable field
        text: data.get('text')!.toString(),
        locale: data.get('locale')!.toString(),
        type: data.get('type')! && data.get('type')!.toString() // nullable field
    };
    const audios: AudioDTO[] = JSON.parse(data.get('audios')!.toString());
    const documents: DocumentDTO[] = JSON.parse(data.get('documents')!.toString());
    const images: ImageDTO[] = JSON.parse(data.get('images')!.toString());

    if (!blogPost.type) blogPost.type = 'other';


    try {
        const checkBlogPost = await pool.query(`
            SELECT 
                id 
            FROM 
                blog_posts 
            WHERE 
                id = $1;`,
            [id]
        );

        if (checkBlogPost.rows.length === 0) {
            return c.json({ error: 'Blog post not found' }, 404);
        }

        await pool.query(`
            UPDATE 
                blog_posts
            SET 
                title = $1, subtitle = $2, text = $3, locale = $4, type = $5
            WHERE 
                id = $6;`,
            [blogPost.title, blogPost.subtitle, blogPost.text, blogPost.locale, blogPost.type, id]
        );

        const blogPostsImagesResults = await pool.query(
            `
            SELECT 
                bpi.image_id, bpi.blog_post_id, 
                im.id, im.path, im.description, im.title 
            FROM 
                blog_posts_images bpi
            LEFT JOIN 
                images im ON im.id = bpi.image_id
            WHERE 
                bpi.blog_post_id = $1;`,
            [id]
        );

        const imagesToDelete = blogPostsImagesResults.rows.filter(
            (im) => !images.map((i) => i.id).includes(im.image_id)
        );
        const imagesToUpsert = images.filter(
            (im) => !im.id || !imagesToDelete.map((i) => i.id).includes(im.id)
        );

        await Promise.all(
            imagesToDelete.map(async (im) => {
                await pool.query(`
                    DELETE FROM 
                        blog_posts_images 
                    WHERE 
                        blog_post_id = $1 AND image_id = $2`,
                    [id, im.id]);
            })
        );

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
                            blog_posts_images (blog_post_id, image_id) 
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

        const blogPostsAudiosResults = await pool.query(
            `
            SELECT 
                bpa.audio_id, bpa.blog_post_id, 
                a.id, a.path, a.description, a.title 
            FROM 
                blog_posts_audios bpa
            LEFT JOIN 
                audios a ON a.id = bpa.audio_id
            WHERE 
                bpa.blog_post_id = $1;`,
            [id]
        );

        const audiosToDelete = blogPostsAudiosResults.rows.filter(
            (audio) => !audios.map((a) => a.id).includes(audio.audio_id)
        );
        const audiosToUpsert = audios.filter(
            (audio) => !audio.id || !audiosToDelete.map((a) => a.id).includes(audio.id)
        );

        await Promise.all(
            audiosToDelete.map(async (audio) => {
                await pool.query(`
                    DELETE FROM 
                        blog_posts_audios 
                    WHERE 
                        blog_post_id = $1 AND audio_id = $2`,
                    [id, audio.id]);
            })
        );

        await Promise.all(
            audiosToUpsert.map(async (audio) => {
                if (!audio.id) {
                    const result = await pool.query(`
                        INSERT INTO 
                            audios (path, description, title, locale)
                        VALUES 
                            ($1, $2, $3, $4)
                        RETURNING 
                            id;`,
                        [audio.path, audio.description, audio.title, audio.locale]
                    );

                    await pool.query(`
                        INSERT INTO 
                            blog_posts_audios (blog_post_id, audio_id) 
                        VALUES
                            ($1, $2);`,
                        [id, result.rows[0].id]
                    );
                } else {
                    await pool.query(`
                        UPDATE 
                            documents 
                        SET 
                            path = $1, description = $2, title = $3, locale = $4   
                        WHERE 
                            id = $5;`,
                        [audio.path, audio.description, audio.title, audio.locale, audio.id]
                    );
                }

            })
        );

        const blogPostsDocumentsResults = await pool.query(
            `
            SELECT 
                bpd.document_id, bpd.blog_post_id, 
                d.id, d.path, d.description, d.title 
            FROM 
                blog_posts_documents bpd
            LEFT JOIN 
                documents d ON d.id = bpd.document_id
            WHERE 
                bpd.blog_post_id = $1;`,
            [id]
        );

        const documentsToDelete = blogPostsDocumentsResults.rows.filter(
            (doc) => !documents.map((d) => d.id).includes(doc.document_id)
        );
        const documentsToUpsert = documents.filter(
            (doc) => !doc.id || !documentsToDelete.map((d) => d.id).includes(doc.id)
        );

        await Promise.all(
            documentsToDelete.map(async (doc) => {
                await pool.query(`
                    DELETE FROM 
                        blog_posts_documents 
                    WHERE 
                        blog_post_id = $1 AND document_id = $2`,
                    [id, doc.id]);
            })
        );

        await Promise.all(
            documentsToUpsert.map(async (doc) => {
                if (!doc.id) {
                    const result = await pool.query(`
                        INSERT INTO 
                            documents (path, description, title, locale)
                        VALUES 
                            ($1, $2, $3, $4)
                        RETURNING 
                            id;`,
                        [doc.path, doc.description, doc.title, doc.locale]
                    );

                    await pool.query(`
                        INSERT INTO 
                            blog_posts_documents (blog_post_id, document_id) 
                        VALUES
                            ($1, $2);`,
                        [id, result.rows[0].id]
                    );
                } else {
                    await pool.query(`
                        UPDATE 
                            documents 
                        SET 
                            path = $1, description = $2, title = $3, locale = $4   
                        WHERE 
                            id = $5;`,
                        [doc.path, doc.description, doc.title, doc.locale, doc.id]
                    );
                }

            })
        );

        return c.json({ message: `Blog post ${id} updated successfully` }, 200);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to update blog content into DB' }, 500);
    }
});

blogPosts.delete('/:id', authGuard, async (c) => {
    const pool: Pool = c.get('db');
    const id = c.req.param('id');

    try {
        const checkBlogPost = await pool.query(`
            SELECT 
                id 
            FROM 
                blog_posts 
            WHERE 
                id = $1;`,
            [id]
        );

        if (checkBlogPost.rows.length === 0) {
            return c.json({ error: 'Blog post not found' }, 404);
        }

        const checkBlogPostImages = await pool.query(`
            SELECT 
                blog_post_id 
            FROM 
                blog_posts_images 
            WHERE 
                blog_post_id = $1;`,
            [id]
        );


        if (checkBlogPostImages.rows.length > 0) {
            await pool.query(`
                DELETE FROM 
                    blog_posts_images 
                WHERE 
                    blog_post_id = $1`,
                [id]
            );
        }

        const checkBlogPostAudios = await pool.query(`
            SELECT 
                blog_post_id 
            FROM 
                blog_posts_audios 
            WHERE 
                blog_post_id = $1;`,
            [id]
        );


        if (checkBlogPostAudios.rows.length > 0) {
            await pool.query(`
                DELETE FROM 
                    blog_posts_audios 
                WHERE 
                    blog_post_id = $1`,
                [id]
            );
        }

        const checkBlogPostDocuments = await pool.query(`
            SELECT 
                blog_post_id 
            FROM 
                blog_posts_documents 
            WHERE 
                blog_post_id = $1;`,
            [id]
        );


        if (checkBlogPostDocuments.rows.length > 0) {
            await pool.query(`
                DELETE FROM 
                    blog_posts_documents 
                WHERE 
                    blog_post_id = $1`,
                [id]
            );
        }

        await pool.query(`
            DELETE FROM 
                blog_posts 
            WHERE 
                id = $1`,
            [id]
        );

        return c.json(
            {
                message: 'Blog post deleted successfully',
                id
            },
            200
        );
    } catch (error) {
        console.error('Error deleting blog post: ', error);
        return c.json({ error: 'Failed to delete blog post' }, 500);
    }
});

export default blogPosts;
