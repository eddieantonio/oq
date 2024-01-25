import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { makeNewParticipantId } from '$lib/server/participants';
import {
    getParticipationCode,
    saveParticipant,
    setParticipantAssignments
} from '$lib/server/database';
import { validateParticipationCode } from '$lib/server/validate-participation-codes';
import type { ClassroomId } from '$lib/server/newtypes';
import { assignmentGenerator } from '$lib/server/create-assignments';

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
        if (!codeOk) throw error(StatusCodes.BAD_REQUEST, 'The participation code was incorrect.');

        const participantID = makeNewParticipantId();

        await saveParticipant(participantID, classroom);
        cookies.set('participant_id', participantID, { path: '/' });

        // Give the participant their assignments:
        // TODO: should this be done in a later stage?
        const assignments = assignmentGenerator.next().value;
        if (assignments == null)
            throw error(StatusCodes.INTERNAL_SERVER_ERROR, 'Could not generate assignments');
        await setParticipantAssignments(participantID, assignments);

        throw redirect(StatusCodes.SEE_OTHER, '/questionnaire');
    }
};
