import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { makeNewParticipantId } from '$lib/server/participants';
import { getParticipationCode, saveParticipant } from '$lib/server/database';
import { validateParticipationCode } from '$lib/server/validate-participation-codes';
import type { ClassroomId } from '$lib/server/newtypes';
import { redirectToCurrentStage } from '$lib/server/redirect.js';
import { generateAssignments } from '$lib/server/create-assignments';
import { getTasksForLanguage } from '$lib/server/tasks';
import type { ProgrammingLanguage } from '$lib/types';

// HACK: this global is WAY easier than storing the state in the database,
// but it means that **only one study can run at a time**, unfortunately.
const CURRENT_STUDY_LANGUAGE: ProgrammingLanguage = 'python';
const ASSIGNMENTS = (function () {
    // Lazy initialization of the generator.
    const init = () =>
        generateAssignments(getTasksForLanguage(CURRENT_STUDY_LANGUAGE).map((task) => task.name));

    let instance: ReturnType<typeof init> | null = null;
    return {
        get generator() {
            if (instance == null) instance = init();
            return instance;
        }
    };
})();

export function load({ locals, cookies }) {
    const participant = locals.participant;
    // Unlike most pages, the happy case is that the participant is NOT registered.
    // If the participant is registered, they have already consented, and thus are at some other stage of the trial. Take them there:
    if (participant) redirectToCurrentStage(participant.stage);

    // If they have a voucher but no particpant ID, then they have:
    //  1. Completed the study
    //  2. Opted-out of data collection
    // So just show them their voucher again:
    if (cookies.get('voucher') != null) throw redirect(StatusCodes.SEE_OTHER, '/already-responded');

    return {};
}

export const actions: import('./$types').Actions = {
    /**
     * Handles the POST from the consent form. With the participant's consent,
     * we store their data, and give them a cookie to track their requests.
     *
     * Presently, the participation ID must be checked here, so that we don't
     * have to validate it anywhere else.
     */
    default: async ({ params, request, cookies }) => {
        const classroom = params.classroom as ClassroomId;

        const storedParticipationCode = await getParticipationCode(classroom);
        if (storedParticipationCode == null)
            throw error(StatusCodes.NOT_FOUND, 'The classroom was not found.');

        const data = await request.formData();

        // Check that the participant has consented to all:
        if (data.get('consentedToAll') !== 'true')
            throw error(
                StatusCodes.BAD_REQUEST,
                'You must consent to all of the above to participate.'
            );

        // Make sure the participation code were specified:
        if (!data.has('participation_code'))
            throw error(StatusCodes.BAD_REQUEST, 'The participation code was not specified.');
        const participationCode = data.get('participation_code') as string;

        // Check that the participation code is correct before continuing:
        const codeOk = await validateParticipationCode(storedParticipationCode, participationCode);
        if (!codeOk)
            throw error(StatusCodes.BAD_REQUEST, {
                reason: 'invalid-participation-code',
                message: 'The participation code was incorrect.'
            });

        // Create a participant and given them their assignments right away:
        const participantID = makeNewParticipantId();
        const assignments = unwrap(ASSIGNMENTS.generator.next().value);
        await saveParticipant(participantID, classroom, assignments);
        cookies.set('participant_id', participantID, { path: '/' });

        throw redirect(StatusCodes.SEE_OTHER, '/questionnaire');
    }
};

/**
 * Like Rust's unwrap, but for null/undefined.
 * @returns the value, if it exists.
 */
function unwrap<T>(value: NonNullable<T> | null | undefined): T {
    if (value == null) throw new Error('Was undefined, but should never be');
    return value;
}
