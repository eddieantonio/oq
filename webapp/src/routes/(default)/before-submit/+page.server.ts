import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { setParticipantSubmitted } from '$lib/server/database';
import type { ParticipantId } from '$lib/server/newtypes';

export const actions: import('./$types').Actions = {
    default: async ({ cookies }) => {
        const participantId = cookies.get('participant_id') as ParticipantId;
        if (!participantId) throw error(StatusCodes.BAD_REQUEST, 'No participantId cookie found');
        await setParticipantSubmitted(participantId);

        throw redirect(StatusCodes.SEE_OTHER, '/thanks');
    }
};
