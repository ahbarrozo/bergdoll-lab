import { Context, Hono, Next } from 'hono';
import { AppVariables } from './types/hono.types';
import { googleAuth } from '@hono/oauth-providers/google';

const auth = new Hono<{ Variables: AppVariables }>();

const googleAuthMiddleware = googleAuth({
	client_id: Bun.env.GOOGLE_CLIENT_ID,
	client_secret: Bun.env.GOOGLE_CLIENT_SECRET,
	scope: [
		'openid',
		'email',
		'profile',
		'https://www.googleapis.com/auth/calendar.events'
	],
	redirect_uri: `${Bun.env.HOST}:${Bun.env.PORT}/auth/google/callback`,
	// onError: (c, error) => {
	//    console.error("Google OAuth Error:", error);
	//    return c.redirect(`${APP_BASE_URL}/?oauth_error=${encodeURIComponent(error.message || 'Login failed')}`);
	// }
});

// Route to initiate Google OAuth login
auth.get('/google', googleAuthMiddleware);

// Callback route for Google OAuth. The middleware will handle the token exchange
auth.get(
	'/google/callback',
	googleAuthMiddleware,
	async (c) => {
		try {
			const session = c.get('session');
			const token = c.get('token');
			const user = c.get('user-google');

			if (!user || !user.id) {
				console.error('Google OAuth callback: User data not found or missing ID.');
				return c.redirect(`${Bun.env.HOST}:${Bun.env.PORT}/?oauth_error=User data incomplete`);
			}

			session.set('user',
				{
					id: user.id,
					name: user.name,
					email: user.email,
					picture: user.picture,
					accessToken: token!.token,
					// TODO : check if necessary
					// refreshToken: token!.refresh_token, 
					// tokenExpiresAt: Date.now() + (token.expires_in * 1000)
				});

			console.log('User successfully authenticated:', user.name);
			return c.redirect(`${Bun.env.ALLOWED_ORIGIN}/admin`);

		} catch (error) {
			console.error('Error in Google OAuth callback:', error);
			return c.redirect(`${Bun.env.HOST}`);
		}
	}
);

/**
 *  GET request to check existing credentials. It will return the user 
 *  data if it exists, and an error otherwise
 */
auth.get('/verify', (c) => {
	const user = c.get('session')?.get('user');

	if (user) {
		return c.json({ isAuthenticated: true, user });
	}
	return c.json({ isAuthenticated: false }, 401);
});

export const authGuard = async (c: Context<{ Variables: AppVariables }>, next: Next) => {
	const user = c.get('session')?.get('user');

	if (user) {
		await next();
	} else {
		return c.json({ message: 'Unauthorized. Please log in.' }, 401);
	}
};

export default auth;
