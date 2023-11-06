/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema
        .createTable('participants', (table) => {
            table.string('participant_id', 8).primary().notNullable();
            table.timestamp('started_at', { useTz: true }).notNullable();
            table.boolean('consented_to_all').notNullable();
        })
        .createTable('answers', (table) => {
            table
                .string('participant_id', 8)
                .references('participant_id')
                .inTable('participants')
                .notNullable();
            table.string('question_id', 32);
            table.string('answer', 1024);

            table.primary(['participant_id', 'question_id']);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('answers').dropTable('participants');
};
