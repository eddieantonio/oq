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

/**
 * A label for the exercise that the participant is attempting.
 *
 * A note on terminology:
 *
 *      Exercise: an instance of a participant attempting a task/scenario.
 *      Task: erroneous source code that the participant must fix.
 *         Maybe a better name would be Scenario?
 *      Presentation:
 *         What type of error message will be presented to the user for a
 *         particular exercise.
 *           - default
 *           - manually-enhanced
 *           - llm-enhanced
 *      Condition:
 *          Sort of synonymous with "presentation", but uses more generic
 *          scientific terminology.
 *           - control
 *           - treatment A
 *           - treatment B
 *      Assignment:
 *          A participant will do a number of exercises, and each exercise will
 *          have an assigned task (scenario) and presentation (condition).
 *          The assignment is the pairing of a task and a presentation for a
 *          particular exercise.
 */
export type ExerciseId = string & { __exerciseId: never };

/** Uniquely identifies a particular compile event. */
export type CompileEventId = number & { __compileEventId: never };

/** A hexadecimal respresentation of a SHA256 hash of something. */
export type SHA256Hash = string & { __sha256Hash: never };

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

/** A string containing valid Markdown. */
export type MarkdownString = string & { __markdownString: never };
