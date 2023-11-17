/**
 * Classroom selection. This will redirect to the information sheet,
 * WITHOUT setting any cookies!
 */

import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

export const actions: import('./$types').Actions = {
    default: async ({ request }) => {
        // check that 'class=' is in the query string
        const data = await request.formData();
        const participantClass = data.get('class');
        // TODO: Verify that it's a valid class
        if (!participantClass) {
            throw error(StatusCodes.BAD_REQUEST, 'No class selected');
        }

        // TODO: go to the information sheet
        throw redirect(StatusCodes.SEE_OTHER, `/consent?class=${participantClass}`);
    }
};
