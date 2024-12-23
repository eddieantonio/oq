import { error } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { redirectToCurrentStage } from '$lib/server/redirect';
import { setParticipantStage } from '$lib/server/database';
import { taskNames } from '$lib/server/tasks';
import { type Stage, stages } from '$lib/types';
import type { ParticipantId } from '$lib/server/newtypes';

/**
 * @type {import('@sveltejs/kit').Load}
 */
export function load({ cookies }) {
    return {
        taskNames: taskNames(),
        stages: stages(),
        voucher: cookies.get('voucher')
    };
}

export const actions: import('./$types').Actions = {
    debugResetParticipantId: async ({ cookies }) => {
        cookies.delete('participant_id');
    },
    debugResetVoucher: async ({ cookies }) => {
        cookies.delete('voucher');
    },
    setStage: async ({ cookies, request }) => {
        const participantId = cookies.get('participant_id') as ParticipantId | null;
        if (participantId == null)
            throw error(StatusCodes.UNAUTHORIZED, 'Requires a participant ID');

        const data = await request.formData();
        const stage = data.get('stage');
        if (!isStageName(stage)) throw error(StatusCodes.BAD_REQUEST, 'Invalid stage');

        await setParticipantStage(participantId, stage);
        redirectToCurrentStage(stage);
    }
};

function isStageName(name: string | File | null): name is Stage {
    if (name == null) return false;
    if (typeof name != 'string') return false;
    return (stages() as readonly string[]).includes(name);
}
