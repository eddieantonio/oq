import { redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { deleteParticipant, setParticipantSubmitted } from '$lib/server/database';
import { redirectToCurrentStage } from '$lib/server/redirect';

export function load({ locals }) {
    const participant = locals.expectParticipant();
    if (participant.stage != 'final-questionnaire') redirectToCurrentStage(participant.stage);
}

export const actions: import('./$types').Actions = {
    default: async ({ cookies, request, locals }) => {
        const participant = locals.expectParticipant();
        const participantId = participant.participant_id;

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
