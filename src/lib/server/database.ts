import knex from 'knex';

// Maps a question id to the response.
export interface Answer {
    question_id: string;
    answer: string;
}
// That's it for now. Later I will add "partipant_id" later.

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

const Answers = () => db('answers');

export async function saveAnswer(answer: Answer) {
    await Answers().insert(answer).onConflict('question_id').merge();
}

export async function getAllAnswers(): Promise<Answer[]> {
    return await Answers().select('*');
}
