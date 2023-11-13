/**
 * Newtype for participant IDs.
 *
 * Try to avoid using raw strings when dealing with participant IDs.
 */
export type ParticipantId = string & { __participantId: never };

// For now, there is only one kind of participant ID.
export function makeNewParticipantId(): ParticipantId {
    return 'TEST01' as ParticipantId;
}
