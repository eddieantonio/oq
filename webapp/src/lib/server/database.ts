import knex from 'knex';

import config from '../../../knexfile';
import type {
    ClassroomId,
    CompileEventId,
    ParticipantId,
    PasswordHash,
    SHA256Hash
} from './newtypes';
import { hashSourceCode } from './hash';

////////////////////////////////////////////// Config //////////////////////////////////////////////

const db = knex(config);

////////////////////////////////////////////// Tables //////////////////////////////////////////////

/**
 * A participant's answer to a question.
 */
export interface Answer {
    participant_id: ParticipantId;
    question_id: string;
    answer: string;
}

/**
 * A study participant.
 */
export interface Participant {
    participant_id: ParticipantId;
    classroom_id: ClassroomId;
    started_at: Date;
    consented_to_all: boolean;
}

/**
 * A classroom, or cohort.
 *
 * Every participant belongs to one, and this determines what error messages
 * they'l see.
 */
export interface Classroom {
    classroom_id: ClassroomId;
    hashed_participation_code: PasswordHash;
}

/**
 * A compile event is logged when a user presses "run code", and it is received
 * by the server. This logs
 *
 */
export interface CompileEvent {
    compile_event_id: number;
    participant_id: ParticipantId;
    submitted_at: Date;
    snapshot_id: SHA256Hash;
}

/**
 * A code snapshot is the full source code that was submitted as a compile
 * event. To save space, snapshots are shared by multiple users if they submit
 * the exact same code (byte-for-byte). This happens at the very start (all
 * users "compile" code immediately when starting the editor) or for getting the
 * solution (there are usually only a few valid solutions).
 */
export interface Snapshot {
    /* The hash of the utf8 bytes of the entire source code. */
    snapshot_id: SHA256Hash;
    source_code: string;
}

/**
 * The result of compiling or running code. At present, this includes the
 * entire, unedited output from the RCE server, and a redundant field that
 * indicates whether the file was successfully run/compiled.
 */
export interface CompileOutput {
    compile_event_id: number;
    success: boolean;
    compile_errors: Idk;
}

////////////////////////////////// Tables (for use in TypeScript) //////////////////////////////////

const Participants = () => db<Participant>('participants');
const Answers = () => db<Answer>('answers');
const Classrooms = () => db<Classroom>('classrooms');
const CompileEvent = () => db<CompileEvent>('compile_events');
const Snapshot = () => db<Snapshot>('snapshots');
const CompileOutputs = () => db<CompileOutput>('compile_outputs');

//////////////////////////////////////////// Public API ////////////////////////////////////////////

/**
 * Saves a new participant to the database.
 */
export async function saveParticipant(participantId: ParticipantId, classroomId: ClassroomId) {
    await Participants()
        .insert({
            participant_id: participantId,
            classroom_id: classroomId,
            started_at: new Date(),
            // If we've gotten here, they have consented to all questions.
            consented_to_all: true
        })
        // TODO: there should NEVER be a duplicate ID, so this merging behavior has to go.
        .onConflict('participant_id')
        .merge();
}

/**
 * Retrieves the hashed participation code for the given classroom.
 */
export async function getParticipationCode(classroomId: ClassroomId): Promise<PasswordHash> {
    const result = await Classrooms()
        .select('hashed_participation_code')
        .where('classroom_id', classroomId)
        .first();

    // TODO: better error handling. An unknown classroom ID should not crash the server.
    if (!result) throw new Error(`No classroom with ID '${classroomId}' exists.`);

    return result.hashed_participation_code;
}

/**
 * Save all answers to the database. All question IDs must be valid.
 *
 * @param answers array of questionnaire answers
 */
export async function saveAnswers(answers: Answer[]) {
    await Answers().insert(answers).onConflict(['question_id', 'participant_id']).merge();
}

export async function getAllAnswers(): Promise<Answer[]> {
    return await Answers().select('*');
}

/**
 * Records a new compile event.
 *
 * @param participantId ID of the participant who submitted the code
 * @param sourceCode The source code they submitted
 * @returns the compile event, useful for later.
 */
export async function logCompileEvent(
    participantId: ParticipantId,
    sourceCode: string
): Promise<CompileEventId> {
    const snapshotId = hashSourceCode(sourceCode);

    // Insert the code snapshot, ignoring if it already exists.
    await Snapshot()
        .insert({
            snapshot_id: snapshotId,
            source_code: sourceCode
        })
        .onConflict('snapshot_id')
        .ignore();

    const [result] = await CompileEvent()
        .insert({
            participant_id: participantId,
            submitted_at: new Date(),
            snapshot_id: snapshotId
        })
        .returning('compile_event_id');

    return result.compile_event_id as CompileEventId;
}

/**
 * Records the result of a compile event.
 *
 * @param compileEventId ID of the compile event
 * @param success Whether the code compiled successfully
 * @param compileErrors Any compile errors that occurred
 */
export async function logCompileOutput(
    compileEventId: CompileEventId,
    results: Idk
): Promise<void> {
    const { success } = results;
    await CompileOutputs().insert({
        compile_event_id: compileEventId,
        success,
        compile_errors: results
    });
}
