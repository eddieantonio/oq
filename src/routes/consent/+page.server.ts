import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { makeNewParticipantId } from '$lib/server/participants';
import { saveParticipant } from '$lib/server/database';

const HTTP_SEE_OTHER = 303;

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        console.table(Object.fromEntries(data.entries()));

        const participantID = makeNewParticipantId();

        // TODO: add the server date to the consent form
        cookies.set('participant_id', participantID, { path: '/' });
        saveParticipant(participantID);

        throw redirect(HTTP_SEE_OTHER, '/questionnaire');
    }
};
