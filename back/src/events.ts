import { Hono } from 'hono';
import { Pool } from 'pg';

import { AppVariables } from './types/hono.types';
import { Event, EventDTO } from './types/Event.type';
import { authGuard } from './auth';

const events = new Hono<{ Variables: AppVariables }>();

/**
 *  GET all events.
 */
events.get('/', async (c) => {
	const pool: Pool = c.get('db');

	try {
		const result = await pool.query(`
            SELECT * FROM events;
        `);

		/* Merge dates and start and stop times. If no start or stop given
		 * the 8h00 to 22h00 time will be chosen
		 */
		const eventsList = result.rows.map((e: Event) => {
			return {
				...e, dates: e.dates.split(' ').map(d => {
					const start = 'T' + (e.start ?? '08:00:00+02:00');
					const stop = 'T' + (e.stop ?? '22:00:00+02:00');
					return { start: d + start, stop: d + stop }
				})
			};
		});
		return c.json(eventsList, 200);
	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to fetch events.' }, 500);
	}
});

/**
 *  POST request to create a new event entry.
 */
events.post('/', authGuard, async (c) => {
	const pool: Pool = c.get('db');

	try {
		const data = await c.req.formData();
		const event: EventDTO = {
			dates: data.get('dates')!.toString(),
			location: data.get('location')!.toString(),
			name: data.get('name')!.toString(),
			start: data.get('start')! && data.get('start')!.toString(), // nullable field
			stop: data.get('stop')! && data.get('stop')!.toString(), // nullable field
			type: data.get('type')! && data.get('type')!.toString(), // nullable field
			link: data.get('link')! && data.get('link')!.toString() // nullable field
		};

		const result = await pool.query(
			`
            INSERT INTO 
                events (dates, location, name, link, start, stop, type)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7)
            RETURNING 
                id;`,
			[event.dates, event.location, event.name, event.link, event.start, event.stop, event.type]
		);

		return c.json({ message: `Event ${result.rows[0].id} created successfully.` }, 201);
	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to insert new contact into DB' }, 500);
	}
});

/**
 *  PUT request to update an event based on its ID. It will
 *  check its existence and updateall the fields available at
 *  the submission form.
 */
events.put('/:id', authGuard, async (c) => {
	const pool: Pool = c.get('db');
	const id = c.req.param('id');

	try {
		const checkEvent = await pool.query(
			`
            SELECT 
                id 
            FROM 
                events 
            WHERE 
                id = $1;`,
			[id]
		);

		if (checkEvent.rows.length === 0) {
			return c.json({ error: 'Event not found' }, 404);
		}

		const data = await c.req.formData();
		const event: EventDTO = {
			dates: data.get('dates')!.toString(),
			location: data.get('location')!.toString(),
			name: data.get('name')!.toString(),
			link: data.get('link')! && data.get('link')!.toString(), // nullable field
			start: data.get('start')! && data.get('start')!.toString(), // nullable field
			stop: data.get('stop')! && data.get('stop')!.toString(), // nullable field
			type: data.get('type')! && data.get('type')!.toString() // nullable field
		};

		await pool.query(
			`
            UPDATE 
                events 
            SET 
                dates = $1, location = $2, name = $3, link = $4, start = $5, stop = $6, type = $7   
            WHERE 
                id = $8 
            RETURNING 
                id;`,
			[event.dates, event.location, event.name, event.link, event.start, event.stop, event.type, id]
		);

		return c.json({ message: `Event ${id} updated successfully` }, 200);
	} catch (error) {
		console.error('Database error: ', error);
		return c.json({ error: 'Failed to insert new event into DB' }, 500);
	}
});

/**
 *  DELETE request to delete an event row based on its ID
 */
events.delete('/:id', authGuard, async (c) => {
	const pool: Pool = c.get('db');
	const id = c.req.param('id');

	try {
		const checkEvent = await pool.query(
			`
            SELECT id FROM events WHERE id = $1;`,
			[id]
		);

		if (checkEvent.rows.length === 0) {
			return c.json({ error: 'Event not found' }, 404);
		}

		await pool.query(
			`
            DELETE FROM events WHERE id = $1 RETURNING id`,
			[id]
		);

		return c.json({ message: 'Event deleted successfully' }, 200);
	} catch (error) {
		console.error('Error deleting event: ', error);
		return c.json({ error: 'Failed to delete event' }, 500);
	}
});

/**
 *  Fetch information from Google Calendat from the authenticated user.
 *  It requires the access token stored in the session cookie, obtained 
 *  after OAuth2 authentication. So far, only future events are being 
 *  fetehed
 */
events.get('/google-calendar', authGuard, async (c) => {
	const sessionUser = c.get('session')?.get('user');

	const accessToken = sessionUser?.accessToken;

	if (!accessToken) {
		return c.json({ error: 'Google Access Token not found in session. Please re-authenticate.' }, 401); // Or 400
	}

	try {
		const calendarId = 'primary'; // 'primary' refers to the user's main calendar
		const timeMin = new Date().toISOString(); // events starting from now
		// const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Events for the next 7 days

		const params = new URLSearchParams({
			timeMin: timeMin,
			// timeMax: timeMax,
			maxResults: '100',          // Max number of events to return
			singleEvents: 'true',      // Expand recurring events into individual instances
			orderBy: 'startTime',
		});

		const googleCalendarApiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params.toString()}`;

		const response = await fetch(googleCalendarApiUrl, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Accept': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Google Calendar API Error Response:', errorData);
			return c.json({
				error: 'Failed to fetch Google Calendar events.',
				details: errorData.error?.message || 'Unknown error from Google API.',
				googleError: errorData.error
			}, 401);
		}

		const eventData = await response.json();

		return c.json({
			message: 'Successfully fetched events.',
			events: eventData.items || []
		});

	} catch (error) {
		console.error('Error fetching Google Calendar events:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
		return c.json({ error: 'Internal server error while fetching calendar events.', details: errorMessage }, 500);
	}
});

export default events;
