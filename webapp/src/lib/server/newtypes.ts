/**
 * @file Newtypes, for the paranoid (I am the paranoid).
 *
 * A newtype wraps an existing type with zero runtime overhead. I use newtypes
 * to wrap primitive types (e.g., number, string) that have special meaning. For
 * example, not just any ol' string can be a SHA256Hash. Having newtypes makes
 * it impossible to make some silly mistakes.
 *
 * See: https://kubyshkin.name/posts/newtype-in-typescript/
 */

/** Uniquely identifies a particular compile event. */
export type CompileEventId = number & { __CompileEventId: never };

/** A hexadecimal respresentation of a SHA256 hash of something. */
export type SHA256Hash = string & { __SHA256Hash: never };

/** A password hash, in the format stored in the database.  */
export type PasswordHash = string & { __passwordHash: never };

/**
 * Uniquely identifies a participant WITHIN A CLASSROOM.
 *
 * It is *possible* that the same person participates in multiple classrooms, in
 * which case, they will have two (or more) participant IDs.
 */
export type ParticipantId = string & { __participantId: never };

/** Uniquely identifies a classroom, or cohort of participants.  */
export type ClassroomId = string & { __classroomId: never };
