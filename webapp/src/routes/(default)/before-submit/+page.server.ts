import { createHash } from 'node:crypto';

import { redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { deleteParticipant, setParticipantSubmitted } from '$lib/server/database';
import { redirectToCurrentStage } from '$lib/server/redirect';
import type { ParticipantId } from '$lib/server/newtypes.js';

export function load({ locals }) {
    const participant = locals.expectParticipant();
    if (participant.stage != 'final-questionnaire') redirectToCurrentStage(participant.stage);

    return {
        voucher: createVoucher(participant.participant_id)
    };
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

        const voucher = createVoucher(participantId);
        cookies.set('voucher', voucher);
        throw redirect(StatusCodes.SEE_OTHER, `/thanks?v=${voucher}`);
    }
};

/**
 * Creates a six-digit code of their participant ID.
 *
 * @param participantId
 * @returns
 */
function createVoucher(participantId: ParticipantId): string {
    const hasher = createHash('sha256');
    hasher.update(participantId);
    const hash = hasher.digest('base64');

    // The voucher is a six-digit code of their hash participant ID.
    return hash.substring(0, 6);
}
