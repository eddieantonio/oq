/**
 * Newtype for participant IDs.
 *
 * Try to avoid using raw strings when dealing with participant IDs.
 */
export type ParticipantId = string & { __participantId: never };

/**
 * Newtype for classroom IDs.

 * Try to avoid using raw strings when dealing with classroom IDs.
 */
export type ClassroomId = string & { __classroomId: never };

/**
 * Creates a new, unique participant ID.
 */
export function makeNewParticipantId(): ParticipantId {
    // For now, there is only one kind of participant ID.
    return 'TEST01' as ParticipantId;
}
