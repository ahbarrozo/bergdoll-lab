import { Pool } from 'pg';
import { Session } from "hono-sessions";

export type SessionData = {
	user?: {
		id: string;
		name?: string;
		email?: string;
		picture?: string;
		accessToken?: string;
	};
};

export type GoogleOAuthToken = {
	token: string;
	expires_in: number;
	scope: string;
	token_type: string;
	id_token?: string;
	refresh_token?: string;
};

export type GoogleUserProfile = {
	id: string;
	email?: string;
	verified_email?: boolean;
	name?: string;
	given_name?: string;
	family_name?: string;
	picture?: string;
	locale?: string;
};

export type AppVariables = {
	db: Pool;
	session: Session<SessionData>;
	token?: GoogleOAuthToken;
	['user-google']?: GoogleUserProfile;
};