import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { makeNewParticipantId } from '$lib/server/participants';
import { getParticipationCode, setParticipantAssignmentsWithState } from '$lib/server/database';
import { validateParticipationCode } from '$lib/server/validate-participation-codes';
import type { ClassroomId } from '$lib/server/newtypes';
import {
    createInitialState,
    yieldNextAssignment,
    type GeneratorState
} from '$lib/server/create-assignments';
import { redirectToCurrentStage } from '$lib/server/redirect.js';
import { TASKS } from '$lib/server/tasks';
import type { TaskName } from '$lib/types/index.js';

export function load({ locals }) {
    const participant = locals.participant;
    // Unlike most pages, the happy case is that the participant is NOT registered.
    // If the participant is registered, they have already consented, and thus are at some other stage of the trial. Take them there:
    if (participant) redirectToCurrentStage(participant.stage);

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

        // Create a new participant, and assign their tasks:
        const participantID = makeNewParticipantId();
        await setParticipantAssignmentsWithState(participantID, classroom, (stateString) => {
            let state: GeneratorState;
            if (stateString == null) {
                const tasks = cTasks();
                if (tasks.length > 6)
                    throw new Error(
                        `${tasks.length} tasks will create too many possible assignments.`
                    );
                state = createInitialState(tasks);
            } else {
                // Hopefully the state is correct.
                state = JSON.parse(stateString);
            }

            const [assignment, updatedState] = yieldNextAssignment(state);
            return [assignment, JSON.stringify(updatedState)];
        });
        cookies.set('participant_id', participantID, { path: '/' });

        throw redirect(StatusCodes.SEE_OTHER, '/questionnaire');
    }
};

// TODO: only tasks for C
function cTasks(): TaskName[] {
    return TASKS.filter((task) => task.language == 'c').map((task) => task.name);
}
