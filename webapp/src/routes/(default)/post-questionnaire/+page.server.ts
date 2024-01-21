/**
 * Save post-questionnaire answers to the database.
 */

import { saveQuestionnaireResponses } from '$lib/server/questionnaire';
import type { Diagnostics } from '$lib/types/diagnostics';
import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

export function load() {
    // TODO: Load all three PEMs, respectively.
    const pem: Diagnostics = {
        format: 'gcc-json',
        diagnostics: [
            {
                children: [],
                'column-origin': 1,
                'escape-source': false,
                kind: 'error',
                locations: [
                    {
                        caret: {
                            'byte-column': 9,
                            column: 9,
                            'display-column': 9,
                            file: 'main.c',
                            line: 1
                        }
                    }
                ],
                message: 'expected ‘=’, ‘,’, ‘;’, ‘asm’ or ‘__attribute__’ before ‘<’ token'
            }
        ]
    };

    return {
        pem
    };
}

export const actions: import('./$types').Actions = {
    /**
     * POST to save the answers and continue to the next page.
     */
    default: async ({ request, locals }) => {
        if (!locals.participant) throw error(StatusCodes.UNAUTHORIZED, 'Not logged in');
        if (locals.participant.stage == 'post-questionnaire')
            throw error(StatusCodes.BAD_REQUEST, 'Not at the correct stage');

        const participantId = locals.participant.participant_id;
        await saveQuestionnaireResponses(participantId, request);
        // On the post-questionnaire page, we do not have to change the stage.
        // The user can advance and go back to this page if they want to change their answers.

        throw redirect(StatusCodes.SEE_OTHER, '/before-submit');
    }
};
