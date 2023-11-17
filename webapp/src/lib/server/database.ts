import knex from 'knex';

import type { ClassroomId, ParticipantId } from './participants';
import config from '../../../knexfile';

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
    classroom: ClassroomId;
    started_at: Date;
    consented_to_all: boolean;
}

////////////////////////////////// Tables (for use in TypeScript) //////////////////////////////////

const Participants = () => db('participants');
const Answers = () => db('answers');

//////////////////////////////////////////// Public API ////////////////////////////////////////////

export async function saveParticipant(participantId: ParticipantId, classroom: ClassroomId) {
    await Participants()
        .insert({
            participant_id: participantId,
            classroom,
            started_at: new Date(),
            // If we've gotten here, they have consented to all questions.
            consented_to_all: true
        })
        // TODO: there should NEVER be a duplicate ID, so this merging behavior has to go.
        .onConflict('participant_id')
        .merge();
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
