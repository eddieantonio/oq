import type { Stage } from '$lib/types';
import { fail, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

/**
 * Redirects the participant to the correct page based on their current stage.
 */
export function redirectToCurrentStage(stage: Stage) {
    if (stage.startsWith('exercise-')) throw redirect(StatusCodes.SEE_OTHER, `/editor`);
    if (stage.startsWith('post-exercise-'))
        throw redirect(StatusCodes.SEE_OTHER, `/post-exercise-questionnaire`);

    switch (stage) {
        case 'retake':
        case 'pre-questionnaire':
            throw redirect(StatusCodes.SEE_OTHER, `/questionnaire`);
        case 'final-questionnaire':
            throw redirect(StatusCodes.SEE_OTHER, `/final-questionnaire`);
        case 'before-submit':
            throw redirect(StatusCodes.SEE_OTHER, `/before-submit`);
        case 'completed':
            throw redirect(StatusCodes.SEE_OTHER, `/already-responded`);
    }

    return fail(StatusCodes.INTERNAL_SERVER_ERROR);
}
