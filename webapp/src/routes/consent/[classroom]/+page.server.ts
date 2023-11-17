import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { makeNewParticipantId, type ClassroomId } from '$lib/server/participants';
import { saveParticipant } from '$lib/server/database';

import { StatusCodes } from 'http-status-codes';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();

        // Check that the participant has consented to all:
        if (data.get('consentedToAll') !== 'true')
            throw error(
                StatusCodes.BAD_REQUEST,
                'You must consent to all of the above to participate.'
            );

        // TODO: validate the classroom
        const classroom = data.get('classroom') as ClassroomId;
        const participantID = makeNewParticipantId();

        await saveParticipant(participantID, classroom);
        cookies.set('participant_id', participantID, { path: '/' });

        throw redirect(StatusCodes.SEE_OTHER, '/questionnaire');
    }
};
