import { setParticipantStage } from '$lib/server/database';
import { redirectToCurrentStage } from '$lib/server/redirect';
import { getTasksForLanguage } from '$lib/server/tasks';
import { redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

export function load() {
    return {
        // Disabled in BDIC study due to access issues:
        shouldShowVideo: false,
        // How many exercises the participant will do:
        // TODO: DO NOT HARDCODE THE PROGRAMMING LANGUAGE
        tasks: getTasksForLanguage('python').length
    };
}

export const actions: import('./$types').Actions = {
    /**
     * POST from the briefing page to continue to the first exercise.
     */
    default: async ({ locals }) => {
        const participant = locals.expectParticipant();
        if (participant.stage != 'pre-questionnaire') redirectToCurrentStage(participant.stage);

        await setParticipantStage(participant.participant_id, 'exercise-1');
        throw redirect(StatusCodes.SEE_OTHER, '/editor');
    }
};
