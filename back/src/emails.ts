import { Hono } from 'hono';
import { Pool } from 'pg';
import { AppVariables } from './types/hono.types';
import { Email, EmailSubscription, EmailSubscriptionDTO } from './types/Email.type';
import { authGuard } from './auth';
import { Resend } from 'resend';
import { isEmpty } from './common/dataParse';

const emails = new Hono<{ Variables: AppVariables }>();
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 *  GET all emails
 */
emails.get('/', authGuard, async (c) => {
    const pool: Pool = c.get('db');
    const query = c.req.query('locale');
    const whereClause: string = query
        ? `WHERE e.locale = '${query}'`
        : '';

    try {
        const result = await pool.query(`
            SELECT 
                e.id, e.date, e.email, e.locale, e.events, e.updates 
            FROM 
                emails e
            ${whereClause}
            ORDER BY
                e.email;
        `);

        return c.json(result.rows, 200);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to fetch emails.' }, 500);
    }
});

/**
 *  POST request to create a new subscriber to mailing list. It \
 *  will insert the new rows in the emails tables
 */
emails.post('/', async (c) => {
    const pool: Pool = c.get('db');

    try {
        const data = await c.req.formData();
        const email: EmailSubscriptionDTO = {
            email: data.get('email')!.toString(),
            events: JSON.parse(data.get('events')!.toString()),
            updates: JSON.parse(data.get('updates')!.toString()),
            locale: data.get('locale')!.toString()
        };
        console.log(email)
        const checkEmail = await pool.query(`
            SELECT 
                id 
            FROM 
                emails
            WHERE 
                email = $1;`,
            [email.email]
        );

        if (checkEmail.rows.length === 1) {
            return c.json({ error: 'Email already in database' }, 404);
        }

        console.log(checkEmail.rows)
        const result = await pool.query(`
            INSERT INTO 
                emails (email, events, updates, locale) 
            VALUES 
                ($1, $2, $3, $4)
            RETURNING 
                id;`,
            [email.email, email.events, email.updates, email.locale]);
        console.log(result)
        return c.json(result.rows[0], 201);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to insert new email into DB' }, 500);
    }
});

/**
 *  PUT request to update an email entry based on its ID. It will
 *  check its existence, fetch images associated with it, and update
 *  all the fields available at the submission form, images included,
 *  if needed
 */
emails.put('/:id', authGuard, async (c) => {
    const pool: Pool = c.get('db');
    const id = c.req.param('id');
    const data = await c.req.formData();
    const email: EmailSubscriptionDTO = {
        email: data.get('email')!.toString(),
        events: JSON.parse(data.get('events')!.toString()),
        updates: JSON.parse(data.get('updates')!.toString()),
        locale: data.get('locale')!.toString()
    };

    try {
        const checkEmail = await pool.query(`
            SELECT 
                id 
            FROM 
                emails
            WHERE 
                id = $1;`,
            [id]
        );

        if (checkEmail.rows.length === 0) {
            return c.json({ error: 'Email not found' }, 404);
        }

        await pool.query(`
            UPDATE 
                emails
            SET 
                email = $1, events = $2, updates = $3, locale = $4 
            WHERE 
                id = $5;`,
            [email.email, email.events, email.updates, email.locale, id]
        );

        return c.json({ message: `Email ${id} updated successfully` }, 200);
    } catch (error) {
        console.error('Database error: ', error);
        return c.json({ error: 'Failed to update email into DB' }, 500);
    }
});

emails.delete('/:id', authGuard, async (c) => {
    const pool: Pool = c.get('db');
    const id = c.req.param('id');

    try {
        const checkEmail = await pool.query(`
            SELECT 
                id 
            FROM 
                emails
            WHERE 
                id = $1;`,
            [id]
        );

        if (checkEmail.rows.length === 0) {
            return c.json({ error: 'Email not found' }, 404);
        }

        await pool.query(`
            DELETE FROM 
                emails 
            WHERE 
                id = $1`,
            [id]
        );

        return c.json(
            {
                message: 'Email address deleted successfully',
                id
            },
            200
        );
    } catch (error) {
        console.error('Error deleting email address: ', error);
        return c.json({ error: 'Failed to delete email address' }, 500);
    }
});



emails.post('/send_email', authGuard, async (c) => {
    try {
        const pool: Pool = c.get('db');
        const form = await c.req.formData();
        const email: Email = {
            text: form.get('text')! && form.get('text')!.toString(),
            title: form.get('title')! && form.get('title')!.toString(),
            type: form.get('type')! && form.get('type')!.toString(),
            locale: form.get('locale')! && form.get('locale')!.toString()
        };

        if (isEmpty(email.text) ||
            isEmpty(email.title) ||
            isEmpty(email.type)) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        const whereClause: string =
            `WHERE (e.locale = '${email.locale}')
             AND (e.events = ${email.type === 'events'}
             OR e.updates = ${email.type === 'updates'}) `;

        const emailsResults = await pool.query(`
            SELECT
                e.email 
            FROM 
                emails e
            ${whereClause}
            ORDER BY
                e.email;
        `);

        const addresses = emailsResults.rows.map(r => r.email);

        if (addresses.length === 0) {
            console.error('No e-mail addresses found with these parameters.');
            return c.json({ error: 'No e-mail addresses found with these parameters.' }, 404);
        }

        const unsubscribeSecret = process.env.UNSUBSCRIBE_SECRET;
        const baseUrl = process.env.HOST + ':' + process.env.PORT;

        const emailPromises = addresses.map(async (address) => {
            console.log({ address })
            const tokenResult = await pool.query(
                `SELECT
                    create_unsubscribe_token($1, $2)
                AS token`,
                [address, unsubscribeSecret]
            );
            const token = tokenResult.rows[0].token;
            const unsubscribeUrl = `${baseUrl}/emails/unsubscribe?token=${token}&locale=${email.locale}`;


            return resend.emails.send({
                from: 'onboarding@resend.dev', // Must be your verified domain
                to: [address],
                subject: email.title,
                headers: {
                    'X-Mailer': 'Nóra Toth-Fekete',
                    'X-Priority': '3',
                    'MIME-Version': '1.0',
                    'Content-Type': 'multipart/alternative',
                    'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:unsubscribe@yourdomain.com?subject=Unsubscribe&body=Please unsubscribe ${address}>`,
                    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                    'X-Auto-Response-Suppress': 'All',
                },
                html: `

                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://fonts.googleapis.com/css2?family=Questrial&display=swap" rel="stylesheet">
                    <style>
                        .email-container {
                            font-family: 'Questrial', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                            }
                    </style>
                </head>
                <body>
                    <div style="background-color: oklch(91.586% 0.006 53.44);
                                color: #1c4f4a;
                                font-family: 'Questrial', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                                sans-serif; 
                                margin: 0 auto;
                                padding-bottom: 0;
                                max-width: 600px !important;">
                        <h2 style="font-size: 1.5rem;
                                   font-weight: 700;
                                   padding: 2.0rem;">
                            ${email.title}
                        </h2>
                        <div style="margin: 0.0rem 2.5rem;
                                    padding: 0.5rem 2.5rem; 
                                    background-color: #f5f5f5; 
                                    border-radius: 5px; ">
                            ${email.text}
                            <img src="https://ichef.bbci.co.uk/images/ic/1024x576/p0m29sn4.jpg"></img>
                        </div>
                    </div>
                    <footer style="background-color: oklch(91.586% 0.006 53.44);
                            display: flex;
                            justify-content: center;
                            margin: 0 auto;
                            padding: 2.5rem;
                            max-width: 600px !important;">
                            ${email.locale === 'en' ?
                        `<a href="${unsubscribeUrl}" style="font-size: 10px;">Unsubscribe</a>` :
                        `<a href="${unsubscribeUrl}" style="font-size: 10px;">Se désabonner</a>`} 
                    </footer>
                </body>
            </html>`,
                text: `${email.name ? `From: ${email.name}\nEmail: ${email}\n\n` : ''}${email.text}`,
            });
        });

        const results = await Promise.all(emailPromises);
        const failed = results.filter(r => r.error).length;

        return c.json({
            success: true,
            message: `Successfully sent ${addresses.length - failed} emails. ${failed > 0 ? `, ${failed} failed` : ''}`,
            details: { successful: results.length - failed, failed, total: addresses.length }
        });

    } catch (error) {
        console.error('Email sending error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

emails.get('/unsubscribe', async (c) => {
    const pool: Pool = c.get('db');
    const locale = c.req.query('locale') || 'en';
    const token = c.req.query('token');
    const secret = process.env.UNSUBSCRIBE_SECRET;

    console.log('Unsubscribe request - Token:', token, 'Locale:', locale);

    if (!token) {
        if (locale === 'en') {
            return c.html(`
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h2>Invalid Unsubscribe Link</h2>
                    <p>The unsubscribe link is invalid or missing required information.</p>
                    <p><a href="mailto:support@yourdomain.com">Contact Support</a></p>
                </body>
                </html>
            `, 400);
        } else {
            return c.html(`
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h2>Lien de désabonnement invalide</h2>
                    <p>Le lien de désabonnement est invalide ou manque des informations requises.</p>
                    <p><a href="mailto:support@yourdomain.com">Contactez le support</a></p>
                </body>
                </html>
            `, 400);
        }
    }

    try {
        const result = await pool.query(
            'SELECT * FROM unsubscribe_with_token($1, $2)',
            [token, secret]
        );

        const unsubscribeResult = result.rows[0];
        console.log('Unsubscribe result:', unsubscribeResult);

        if (!unsubscribeResult.success) {
            if (locale === 'en') {
                return c.html(`
                    <html>
                    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                        <h2>Unsubscribe Failed</h2>
                        <p><strong>Error:</strong> ${unsubscribeResult.error_message}</p>
                        ${unsubscribeResult.email ? `<p>Email: <strong>${unsubscribeResult.email}</strong></p>` : ''}
                        <p><a href="mailto:support@yourdomain.com">Contact Support</a> if you continue to receive unwanted emails.</p>
                    </body>
                    </html>
                `, 400);
            } else {
                return c.html(`
                    <html>
                    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                        <h2>Échec du désabonnement</h2>
                        <p><strong>Erreur:</strong> ${unsubscribeResult.error_message}</p>
                        ${unsubscribeResult.email ? `<p>Email: <strong>${unsubscribeResult.email}</strong></p>` : ''}
                        <p><a href="mailto:support@yourdomain.com">Contactez le support</a> si vous continuez à recevoir des emails indésirables.</p>
                    </body>
                    </html>
                `, 400);
            }
        }

        if (locale === 'en') {
            return c.html(`
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
                    <h2 style="color: #1C3F10;">Successfully Unsubscribed</h2>
                    <p>The email address <strong>${unsubscribeResult.email}</strong> has been removed from our mailing list.</p>
                    <p>You will no longer receive emails from us. This change is effective immediately.</p>
                    <p style="margin-top: 30px; font-size: 14px; color: #666;">
                        Feel free to resubscribe at <a href="${process.env.HOST}" style="color: #007cba;">our website</a> should you change your mind.
                    </p>
                </body>
                </html>
            `);
        } else {
            return c.html(`
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
                    <h2 style="color: #1C3F10;">Désabonnement réussi</h2>
                    <p>L'adresse email <strong>${unsubscribeResult.email}</strong> a été supprimée de notre liste de diffusion.</p>
                    <p>Vous ne recevrez plus d'emails de notre part. Ce changement est effectif immédiatement.</p>
                    <p style="margin-top: 30px; font-size: 14px; color: #666;">
                        N'hésitez pas à vous réabonner sur <a href="${process.env.HOST}" style="color: #007cba;">notre site web</a> si vous changez d'avis.
                    </p>
                </body>
                </html>
            `);
        }

    } catch (error) {
        console.error('Unsubscribe database error:', error);

        if (locale === 'en') {
            return c.html(`
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h2>Error Processing Request</h2>
                    <p>We encountered an error while processing your unsubscribe request. Please try again later or contact support.</p>
                    <p><a href="mailto:support@yourdomain.com">Contact Support</a></p>
                </body>
                </html>
            `, 500);
        } else {
            return c.html(`
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h2>Erreur de traitement de la demande</h2>
                    <p>Nous avons rencontré une erreur lors du traitement de votre demande de désabonnement. Veuillez réessayer plus tard ou contacter le support.</p>
                    <p><a href="mailto:support@yourdomain.com">Contactez le support</a></p>
                </body>
                </html>
            `, 500);
        }
    }
});

export default emails;
