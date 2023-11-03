/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema
        .createTable('participants', (table) => {
            table.string('participant_id', 8).primary();
            table.string('module', 16);
        })
        .createTable('questions', (table) => {
            table.string('question_id', 32).primary();
            table.string('kind', 16);
        })
        .createTable('answers', (table) => {
            table.string('participant_id', 8).references('participant_id').inTable('participants');
            table.string('question_id', 32).references('question_id').inTable('questions');
            table.string('answer', 1024);

            table.primary(['participant_id', 'question_id']);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('answers').dropTable('questions').dropTable('participants');
};
