/**
 * Save post-exercise questionnaire responses and advance to the next stage.
 */

import { getParticipantAssignment, setParticipantStage } from '$lib/server/database';
import { makeDiagnosticsForAssignment } from '$lib/server/diagnostics-util';
import type { ExerciseId } from '$lib/server/newtypes';
import { savePostExerciseQuestionnaireResponses } from '$lib/server/questionnaire';
import { redirectToCurrentStage } from '$lib/server/redirect.js';
import { nextStage, previousStage, type Stage } from '$lib/types';
import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

// Render the page on the server only.
// This is so we don't shuffle the questions on the client.
export const csr = false;

/**
 * Loads the error message that the participant just saw.
 */
export async function load({ locals }) {
    const participant = locals.expectParticipant();

    if (!participant.stage.startsWith('post-exercise-')) redirectToCurrentStage(participant.stage);

    const exercise = participant.stage.slice('post-'.length) as ExerciseId;
    const currentAssignment = await getParticipantAssignment(participant.participant_id, exercise);
    if (!currentAssignment)
        throw error(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `No assignment found for ${participant.participant_id}: ${exercise}`
        );

    const pem = makeDiagnosticsForAssignment(currentAssignment);
    return {
        pem
    };
}

export const actions: import('./$types').Actions = {
    /**
     * POST to save the answers and continue to the next page.
     */
    default: async ({ request, locals }) => {
        const participant = locals.expectParticipant();
        if (!participant.stage.startsWith('post-exercise-'))
            throw error(StatusCodes.BAD_REQUEST, 'Not at the correct stage');

        const participantId = participant.participant_id;
        const exercise = participant.stage.slice('post-'.length) as ExerciseId;
        await savePostExerciseQuestionnaireResponses(participantId, exercise, request);
        await setParticipantStage(participantId, nextStage(participant.stage));

        if (isLastExercise(participant.stage)) {
            // This is the last exercise. Go to the final questionnaire!
            throw redirect(StatusCodes.SEE_OTHER, '/final-questionnaire');
        } else {
            // Any other exercise. Go to the editor to try another exercise!
            throw redirect(StatusCodes.SEE_OTHER, '/editor');
        }
    }
};

function isLastExercise(stage: Stage) {
    return stage === previousStage('completed');
}
