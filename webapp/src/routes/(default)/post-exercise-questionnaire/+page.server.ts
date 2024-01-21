/**
 * Save post-exercise questionnaire responses and advance to the next stage.
 */

import { setParticipantStage } from '$lib/server/database';
import { saveQuestionnaireResponses } from '$lib/server/questionnaire';
import { nextStage, type Stage } from '$lib/types';
import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

export const actions: import('./$types').Actions = {
    /**
     * POST to save the answers and continue to the next page.
     */
    default: async ({ request, locals }) => {
        if (!locals.participant) throw error(StatusCodes.UNAUTHORIZED, 'Not logged in');
        if (!locals.participant.stage.startsWith('post-exercise-'))
            throw error(StatusCodes.BAD_REQUEST, 'Not at the correct stage');

        const participantId = locals.participant.participant_id;
        await saveQuestionnaireResponses(participantId, request);
        await setParticipantStage(participantId, nextStage(locals.participant.stage));

        if (isLastExercise(locals.participant.stage)) {
            // This is the last exercise. Go to the final questionnaire!
            throw redirect(StatusCodes.SEE_OTHER, '/final-questionnaire');
        } else {
            // Any other exercise. Go to the editor to try another exercise!
            throw redirect(StatusCodes.SEE_OTHER, '/editor');
        }
    }
};

function isLastExercise(stage: Stage) {
    return stage === 'post-exercise-3';
}
