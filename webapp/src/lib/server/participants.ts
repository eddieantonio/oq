import type { ParticipantId } from './newtypes';

/**
 * Creates a new, unique participant ID.
 */
export function makeNewParticipantId(): ParticipantId {
    return crypto.randomUUID() as ParticipantId;
}
