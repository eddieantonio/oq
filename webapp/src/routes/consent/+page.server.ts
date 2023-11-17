import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { makeNewParticipantId } from '$lib/server/participants';
import { saveParticipant } from '$lib/server/database';

import { StatusCodes } from 'http-status-codes';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        console.table(Object.fromEntries(data.entries()));

        // TODO: check that all boxes are truthy, else reject it.

        const participantID = makeNewParticipantId();

        await saveParticipant(participantID);
        cookies.set('participant_id', participantID, { path: '/' });

        throw redirect(StatusCodes.SEE_OTHER, '/questionnaire');
    }
};
