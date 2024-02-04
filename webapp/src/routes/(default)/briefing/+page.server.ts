import { setParticipantStage } from '$lib/server/database';
import { TASKS } from '$lib/server/tasks';
import { redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

export function load() {
    return {
        // How many exercises the participant will do:
        tasks: TASKS.length
    };
}

export const actions: import('./$types').Actions = {
    /**
     * POST from the briefing page to continue to the first exercise.
     */
    default: async ({ locals }) => {
        const participant = locals.expectParticipant();
        await setParticipantStage(participant.participant_id, 'exercise-1');
        throw redirect(StatusCodes.SEE_OTHER, '/editor');
    }
};
