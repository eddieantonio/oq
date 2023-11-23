/**
 * Save code submission to the database.
 */

import type { ParticipantId } from '$lib/server/newtypes';
import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

export const actions: import('./$types').Actions = {
    /**
     * POST to submit the code solution.
     */
    submit: async ({ cookies }) => {
        const participant = cookies.get('participant_id') as ParticipantId;
        if (!participant) throw error(StatusCodes.BAD_REQUEST, 'No ParticipantId found');

        // TODO: do SOMETHING with the posted code

        throw redirect(StatusCodes.SEE_OTHER, '/post-questionnaire');
    }
};
