import knex from 'knex';

import config from '../../../knexfile';
import type {
    ClassroomId,
    CompileEventId,
    ExerciseId,
    ParticipantId,
    PasswordHash,
    SHA256Hash
} from './newtypes';
import { hashSourceCode } from './hash';
import type { RunResult } from './run-code';
import { type Assignment, type Condition, type Stage, firstStage } from '$lib/types';

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
    exercise_id?: ExerciseId | null;
}

/**
 * A study participant.
 */
export interface Participant {
    participant_id: ParticipantId;
    classroom_id: ClassroomId;
    stage: Stage;
    started_at: Date;
    submitted_at?: Date;
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
 * entire, unedited output from the code execution server, and a redundant field that
 * indicates whether the file was successfully run/compiled.
 */
export interface CompileOutput {
    compile_event_id: number;
    success: boolean;
    compile_errors: RunResult;
}

/**
 * Inserted when a participant starts an exercise.
 */
export interface ExerciseAttempt {
    participant_id: ParticipantId;
    exercise_id: ExerciseId;
    started_at: Date;
}

/**
 * Assigns a task (scenario) and presentation (condition) for each exercise.
 */
export interface ParticipantAssignment {
    participant_id: ParticipantId;
    exercise_id: ExerciseId;
    condition: Condition;
    task: string;
}

/**
 * Inserted when a participant completes an exercise, either by submitting a
 * solution or from a timeout.
 */
export interface CompletedExerciseAttempt {
    participant_id: ParticipantId;
    exercise_id: ExerciseId;
    completed_at: Date;
    reason: 'submitted' | 'skipped' | 'timed-out';
}

/**
 * Links a compile event with an exercise attempt.
 */
export interface ExerciseCompileEvent {
    compile_event_id: CompileEventId;
    participant_id: ParticipantId;
    exercise_id: ExerciseId;
}

/**
 * Stores state for the classroom. Currently, the state is updated every time a participant
 * joins the classroom.
 */
export interface ClassroomState {
    classroom_id: ClassroomId;
    state: string | null;
}

////////////////////////////////// Tables (for use in TypeScript) //////////////////////////////////

const Participants = () => db<Participant>('participants');
const Answers = () => db<Answer>('answers');
const Classrooms = () => db<Classroom>('classrooms');
const CompileEvent = () => db<CompileEvent>('compile_events');
const Snapshot = () => db<Snapshot>('snapshots');
const CompileOutputs = () => db<CompileOutput>('compile_outputs');
const ExerciseAttempts = () => db<ExerciseAttempt>('exercise_attempts');
// Note: CompletedExerciseAttempts is never used by itself, but always in a transaction.
const ExerciseCompileEvents = () => db<ExerciseCompileEvent>('exercise_compile_events');
const ParticipantAssignments = () => db<ParticipantAssignment>('participant_assignments');
// Note: ClassroomStates is only used in a transaction.

//////////////////////////////////////////// Public API ////////////////////////////////////////////

/**
 * Fetches the participant with the given ID. Throws an error if no participant exists.
 */
export async function getParticipant(participantId: ParticipantId): Promise<Participant> {
    const participant = await getParticipantPossiblyUndefined(participantId);
    if (!participant) {
        throw new Error(`No participant with ID ${participantId}`);
    }
    return participant;
}

/**
 * Fetches the participant with the given ID, or undefined if no participant exists.
 */
export async function getParticipantPossiblyUndefined(
    participantId: ParticipantId
): Promise<Participant | undefined> {
    return await Participants().where('participant_id', participantId).first();
}

/**
 * Saves a new participant to the database.
 */
export async function saveParticipant(participantId: ParticipantId, classroomId: ClassroomId) {
    await Participants().insert({
        participant_id: participantId,
        classroom_id: classroomId,
        started_at: new Date(),
        stage: firstStage(),
        // If we've gotten here, they have consented to all questions.
        consented_to_all: true
    });
}

/**
 * Fetches all of the task/condition assignments for the given participant.
 */
export async function getAllParticipantAssignments(
    participantId: ParticipantId
): Promise<ParticipantAssignment[]> {
    return await ParticipantAssignments().where('participant_id', participantId);
}

/**
 * Fetches the task/condition assignment for the given participant and exercise.
 */
export async function getParticipantAssignment(
    participantId: ParticipantId,
    exerciseId: ExerciseId
): Promise<ParticipantAssignment | undefined> {
    return await ParticipantAssignments()
        .where('participant_id', participantId)
        .andWhere('exercise_id', exerciseId)
        .first();
}

/**
 * @returns both the participant's current assignment and the time they started,
 * if they have already started the exercise.
 */
export async function getCurrentParticipantAssignment(
    participantId: ParticipantId,
    exerciseId: ExerciseId
): Promise<[Assignment, number | null]> {
    const result = await db
        .select('condition', 'task', 'started_at')
        .from('participant_assignments')
        .leftOuterJoin('exercise_attempts', function () {
            this.on(
                'participant_assignments.participant_id',
                '=',
                'exercise_attempts.participant_id'
            ).andOn('participant_assignments.exercise_id', '=', 'exercise_attempts.exercise_id');
        })
        .where('participant_assignments.participant_id', participantId)
        .andWhere('participant_assignments.exercise_id', exerciseId)
        .first();

    const { condition, task, started_at } = result;
    const startedAt: number | null = started_at != null ? started_at.valueOf() : null;
    const assignment: Assignment = { condition, task };
    return [assignment, startedAt];
}

/**
 * Sets all of the task/condition assignments for the given participant.
 */
export async function setParticipantAssignments(
    participantId: ParticipantId,
    assignments: Assignment[]
) {
    await ParticipantAssignments().insert(
        assignments.map((assignment, index) => ({
            participant_id: participantId,
            exercise_id: `exercise-${index + 1}` as ExerciseId,
            condition: assignment.condition,
            task: assignment.task
        }))
    );
}

/**
 * Updates the participant's progress. This function does not do any validation,
 * so make sure the stage is valid!
 */
export async function setParticipantStage(participantId: ParticipantId, stage: Stage) {
    await Participants().update({ stage }).where('participant_id', participantId);
}

/**
 * Sets that the participant has submitted the questionnaire.
 */
export async function setParticipantSubmitted(participantId: ParticipantId): Promise<void> {
    // TODO: check if already submitted?
    await Participants()
        .update({ stage: 'completed', submitted_at: new Date() })
        .where('participant_id', participantId);
}

/**
 * Deletes the participant and all of their data.
 */
export async function deleteParticipant(participantId: ParticipantId) {
    await Participants().delete().where('participant_id', participantId);
}

/**
 * Retrieves the hashed participation code for the given classroom.
 */
export async function getParticipationCode(classroomId: ClassroomId): Promise<PasswordHash | null> {
    const result = await Classrooms()
        .select('hashed_participation_code')
        .where('classroom_id', classroomId)
        .first();

    if (!result) return null;
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

/**
 * Save all answers to the database, associated with a particular exercise.
 *
 * @param exercise The ID of the exercise to associate these answers with.
 * @param answers a list of answers from the questionnaire
 */
export async function saveAnswersForExercise(exercise: ExerciseId, answers: Answer[]) {
    const answersWithExerciseId = answers.map((answer) => ({
        ...answer,
        // HACK! Since question ID is part of the primary key, we need to make
        // it unique for each exercise.  Originally, I wanted to add exercise Id
        // to the primary key, but that would make exercise ID null in some
        // cases, which gave me weird integrity constraint errors.
        // There are probably better ways to model this...
        question_id: `${exercise}:${answer.question_id}` as string,
        exercise_id: exercise
    }));
    await Answers()
        .insert(answersWithExerciseId)
        .onConflict(['question_id', 'participant_id'])
        .merge();
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
    sourceCode: string,
    exerciseId: ExerciseId | null
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

    const compileEventId = result.compile_event_id as CompileEventId;

    if (exerciseId != null) {
        await ExerciseCompileEvents().insert({
            participant_id: participantId,
            exercise_id: exerciseId,
            compile_event_id: compileEventId
        });
    }

    return compileEventId;
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
    results: RunResult
): Promise<void> {
    const { success } = results;
    await CompileOutputs().insert({
        compile_event_id: compileEventId,
        success,
        compile_errors: results
    });
}

/**
 * Logs the start of an exercise attempt.
 */
export async function logExerciseAttemptStart(
    participantId: ParticipantId,
    exerciseId: ExerciseId
): Promise<number> {
    await ExerciseAttempts()
        .insert({
            participant_id: participantId,
            exercise_id: exerciseId,
            started_at: new Date()
        })
        .onConflict(['participant_id', 'exercise_id'])
        .ignore();

    const ret = await ExerciseAttempts()
        .select('started_at')
        .where('participant_id', participantId)
        .andWhere('exercise_id', exerciseId)
        .first();
    if (ret == null) throw new Error('Should never happen');

    const { started_at } = ret;
    // So... Knex is lying to us. When we fetch a Date from the database... it actually comes back as a number.
    // Using `valueOf` converts it back to a number, which... more useful that nonsense.
    return started_at.valueOf();
}

/**
 * Logs a completed exercise attempt and continues to the given stage.
 */
export async function logExerciseAttemptCompletedAndContinue(
    participantId: ParticipantId,
    exerciseId: ExerciseId,
    reason: CompletedExerciseAttempt['reason'],
    stage: Stage
) {
    await db.transaction(async (trx) => {
        await trx('completed_exercise_attempts').insert({
            participant_id: participantId,
            exercise_id: exerciseId,
            completed_at: new Date(),
            reason
        });
        await trx('participants')
            .update({
                stage
            })
            .where('participant_id', participantId);
    });
}

export async function setParticipantAssignmentsWithState(
    participantId: ParticipantId,
    classroomId: ClassroomId,
    update: (state: string | null) => [Assignment[], string]
) {
    await db.transaction(async (trx) => {
        // Get the current classroom state
        const row = await trx<ClassroomState>('classroom_state')
            .first('state')
            .where('classroom_id', classroomId);
        const oldState = row?.state ?? null;
        console.log({ oldState });

        // Fetch the new assignments
        const [assignments, newState] = update(oldState);

        // Create the new participant
        await Participants()
            .insert({
                participant_id: participantId,
                classroom_id: classroomId,
                started_at: new Date(),
                stage: firstStage(),
                // If we've gotten here, they have consented to all questions.
                consented_to_all: true
            })
            .transacting(trx);

        // Insert the participant's assignments
        await trx('participant_assignments').insert(
            assignments.map((assignment, index) => ({
                participant_id: participantId,
                exercise_id: `exercise-${index + 1}` as ExerciseId,
                condition: assignment.condition,
                task: assignment.task
            }))
        );

        // Update the classroom state
        await trx('classroom_state')
            .insert({
                classroom_id: classroomId,
                state: newState
            })
            .onConflict('classroom_id')
            .merge();
    });
}
