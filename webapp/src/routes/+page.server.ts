/**
 * Classroom selection. This will redirect to the information sheet,
 * WITHOUT setting any cookies!
 */

import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

export const actions: import('./$types').Actions = {
    default: async ({ request }) => {
        // check that 'classroom=' is in the query string
        const data = await request.formData();
        const classroom = data.get('classroom');

        // TODO: Verify that it's a valid classroom
        if (!classroom) {
            throw error(StatusCodes.BAD_REQUEST, 'No classroom selected');
        }

        throw redirect(StatusCodes.SEE_OTHER, `/information/${classroom}`);
    }
};
