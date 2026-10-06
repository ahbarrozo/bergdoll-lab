import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CookieStore, sessionMiddleware } from "hono-sessions";
import { googleAuth } from '@hono/oauth-providers/google'
import { Pool } from 'pg';

import { AppVariables } from './types/hono.types';
import aboutSections from './aboutSections';
import auth from './auth';
import blogPosts from './blogPosts';
import blogPostTypes from './blogPostTypes';
import blogComments from './blogComments';
import contacts from './contacts';
import covers from './covers';
import emails from './emails';
import events from './events';
import people from './people';
import socialMedia from './socialMedia';

const googleAuthMiddleware = googleAuth({
	client_id: Bun.env.GOOGLE_CLIENT_ID,
	client_secret: Bun.env.GOOGLE_CLIENT_SECRET,
	scope: [
		'openid',
		'email',
		'profile',
		'https://www.googleapis.com/auth/calendar.events'
	],
	// Optional: If you want to store the refresh token
	// access_type: 'offline', 
	// prompt: 'consent', // Forces consent screen, useful for getting refresh token
	redirect_uri: `${Bun.env.HOST}/auth/google/callback`, // Ensure this matches your Google Cloud Console config
	// onError: (c, error) => {
	//    console.error("Google OAuth Error:", error);
	//    return c.redirect(`${APP_BASE_URL}/?oauth_error=${encodeURIComponent(error.message || 'Login failed')}`);
	// }
});

const pool = new Pool({
	user: Bun.env.DB_USER,
	host: Bun.env.DB_HOST,
	port: Number(Bun.env.DB_PORT),
	database: Bun.env.DB_NAME,
	password: Bun.env.DB_PASSWORD,
	ssl: {
		rejectUnauthorized: Bun.env.ENVIRONMENT === 'production'
	}
});

const sessionStore = new CookieStore();

const app = new Hono<{ Variables: AppVariables }>();

// Middleware to access DB
app.use('*', async (c, next) => {
	c.set('db', pool);
	await next();
});

// Setup for cross origins and possible requests
app.use(
	'*',
	cors({
		origin: [Bun.env.ALLOWED_ORIGIN as string, 'http://localhost:5173'],
		allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
	})
);

// Setup for session management
app.use('*', sessionMiddleware({
	store: sessionStore,
	encryptionKey: Bun.env.SESSION_ENCRYPTION_KEY,
	expireAfterSeconds: 900,
	sessionCookieName: 'session',
	cookieOptions: {
		path: '/',
		httpOnly: Bun.env.ENVIRONMENT === 'production'
	},
}))

// OAuth2 middleware for authentication with Google ID
app.use(
	'/google',
	googleAuth({
		client_id: Bun.env.GOOGLE_ID,
		client_secret: Bun.env.GOOGLE_SECRET,
		scope: ['openid', 'email', 'profile'],
	})
);

app.route('/about_sections', aboutSections);
app.route('/auth', auth);
app.route('/blog_posts', blogPosts);
app.route('/blog_post_types', blogPostTypes);
app.route('/blog_comments', blogComments);
app.route('/contacts', contacts);
app.route('/covers', covers);
app.route('/emails', emails);
app.route('/events', events);
app.route('/people', people);
app.route('/social_media', socialMedia);

app.get('/', (c) => {
	return c.text('API connection established!');
});

// Run the server
const server = Bun.serve({
	port: Bun.env.PORT || 3000,
	fetch: app.fetch,
	hostname: '0.0.0.0'
});

console.log(`Server running at http://${server.hostname}:${server.port}`);
