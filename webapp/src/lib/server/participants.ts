import type { ParticipantId } from './newtypes';

/**
 * Creates a new, unique participant ID.
 */
export function makeNewParticipantId(): ParticipantId {
    // For now, there is only one kind of participant ID.
    return 'TEST01' as ParticipantId;
}
