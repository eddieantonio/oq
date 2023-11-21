import knex from 'knex';

import type { ClassroomId, ParticipantId } from './participants';
import config from '../../../knexfile';
import type { PasswordHash } from './validate-participation-codes';

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

////////////////////////////////// Tables (for use in TypeScript) //////////////////////////////////

const Participants = () => db<Participant>('participants');
const Answers = () => db<Answer>('answers');
const Classrooms = () => db<Classroom>('classrooms');

//////////////////////////////////////////// Public API ////////////////////////////////////////////

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
