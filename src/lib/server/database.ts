import knex from 'knex';
import type { ParticipantId } from './participants';

//////////////////////////////////////////////// Tables ////////////////////////////////////////////////

/**
 * An answer by a participant to a question.
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
    started_at: Date;
    consented_to_all: boolean;
}

////////////////////////////////////////////// Config //////////////////////////////////////////////

// TODO: derive config from knexfile.js
// Example: https://github.com/knex/knex/blob/82f43d53abd2b6215015c11061a9793ed68e8611/test/jake-util/knexfile-imports/knexfile.mjs
const db = knex({
    client: 'better-sqlite3',
    connection: {
        filename: './answers.sqlite3'
    },
    // Okay, so knex REALLY wants you to know that SQLite3 does not support
    // default values, so it practically FORCES you to set this option:
    useNullAsDefault: true,
    debug: true
    // todo: migrations
});

////////////////////////////////// Tables (for use in TypeScript) //////////////////////////////////

const Participants = () => db('participants');
const Answers = () => db('answers');

//////////////////////////////////////////// Public API ////////////////////////////////////////////

export async function saveParticipant(participantId: ParticipantId) {
    // TODO: we... should not merge participants? Should we?
    await Participants()
        .insert({
            participant_id: participantId,
            started_at: new Date(),
            // If we've gotten here, they have consented to all questions.
            consented_to_all: true
        })
        .onConflict('participant_id')
        .merge();
}

export async function saveAnswer(answer: Answer) {
    await Answers().insert(answer).onConflict(['question_id', 'participant_id']).merge();
}

export async function getAllAnswers(): Promise<Answer[]> {
    return await Answers().select('*');
}
