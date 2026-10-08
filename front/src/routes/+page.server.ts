import { fail, redirect, type Actions, type ServerLoad } from '@sveltejs/kit';
import type { ApiData, PageData } from 'src/types/PageData.types';
import type { Image } from 'src/types/Image.types';
import { getLocale } from 'src/paraglide/runtime';

import { PUBLIC_API_ENDPOINT } from '$env/static/public';

type DataTableName = keyof ApiData;

export const actions: Actions = {
    authenticate: async ({ request, cookies, fetch }) => {
        try {
            const formData = await request.formData();
            const response = await fetch(PUBLIC_API_ENDPOINT + `auth/login`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.error)
                // @ts-ignore
                return fail(400, 'Authentication failed');

            cookies.set('token', result.token, { path: '/' });

            return { success: true, data: result };
        } catch (error) {
            return fail(500, { success: false, error });
        }
    },
    saveBlogComment: async ({ request, cookies, fetch }) => {
        try {
            const formData = await request.formData();
            const id = formData.get('id');

            const response = await fetch(PUBLIC_API_ENDPOINT + `blog_comments/${id}`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            return { success: true, data: result };
        } catch (error) {
            return fail(500, { success: false, error });
        }
    },
    subscribe: async ({ request, fetch }) => {
        try {
            const formData = await request.formData();
            const response = await fetch(PUBLIC_API_ENDPOINT + `emails`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            return { success: true, data: result };
        } catch (error) {
            return fail(500, { success: false, error });
        }
    },
};

export const load: ServerLoad = async ({ fetch }): Promise<PageData> => {
    try {
        const dataTables: DataTableName[] = [
            'about_sections',
            'blog_posts',
            'blog_post_types',
            'blog_comments',
            'contacts',
            'covers',
            'events',
            'social_media',
            'people'
        ];

        // Create an array of promise-returning API call functions
        const apiCalls = dataTables.map(dt => {
            let urlSuffix = dt;
            if ([
                'about_sections',
                'blog_posts',
                'people'
            ].includes(dt))
                urlSuffix += `?locale=${getLocale()}`

            return fetch(PUBLIC_API_ENDPOINT + urlSuffix)
        });

        // Wait for all promises to resolve
        const responses = await Promise.all(apiCalls);

        // Process all responses
        const results = await Promise.all(responses.map(response => response.json()));
        const apiData: ApiData = dataTables.reduce((acc: ApiData, table: DataTableName, i) => {
            acc[table] = results[i];
            return acc;
        }, {} as ApiData);

        const coverImg: Image = apiData.covers.length === 0 ? { path: '' } : apiData.covers[0];
        return {
            apiData,
            coverImg
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
