import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { deleteParticipant, setParticipantSubmitted } from '$lib/server/database';
import type { ParticipantId } from '$lib/server/newtypes';

export const actions: import('./$types').Actions = {
    default: async ({ cookies, request }) => {
        const participantId = cookies.get('participant_id') as ParticipantId;
        if (!participantId) throw error(StatusCodes.BAD_REQUEST, 'No participantId cookie found');

        const formData = await request.formData();
        const status = formData.get('status');
        if (status === 'consent') {
            await setParticipantSubmitted(participantId);
        } else if (status === 'revoke-consent') {
            await deleteParticipant(participantId);
            cookies.delete('participant_id');
        }

        throw redirect(StatusCodes.SEE_OTHER, '/thanks');
    }
};
