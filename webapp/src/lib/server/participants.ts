import { StatusCodes } from 'http-status-codes';
import { error, type Cookies } from '@sveltejs/kit';

import type { ParticipantId } from './newtypes';

/**
 * Creates a new, unique participant ID.
 */
export function makeNewParticipantId(): ParticipantId {
    // For now, there is only one kind of participant ID.
    return 'TEST01' as ParticipantId;
}

/**
 * Gets the current participant ID from the participant_id cookie.
 * Throws 401 Unauthorized if the participant is not logged in.
 */
export function getParticipantIdFromCookies(cookies: Cookies): ParticipantId {
    // Ensure the participant is logged in
    const participant = cookies.get('participant_id');
    if (!participant) throw error(StatusCodes.UNAUTHORIZED, 'No ParticipantId found');

    return participant as ParticipantId;
}
