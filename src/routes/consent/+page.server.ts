import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const HTTP_SEE_OTHER = 303;

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        console.table(Object.fromEntries(data.entries()));

        // TODO: add the server date to the consent form
        // TODO: insert the consent into the database

        throw redirect(HTTP_SEE_OTHER, '/questionnaire');
    }
};
