import { getParticipant } from '$lib/server/database.js';
import type { ParticipantId } from '$lib/server/newtypes';

/**
 * Loads the participantId into EVERY page.
 */
export async function load({ cookies }) {
    const participantId = cookies.get('participant_id');

    const participant = participantId ? await getParticipant(participantId as ParticipantId) : null;

    return {
        participantId,
        participant
    };
}
