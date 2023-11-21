/**
 * The migration that creates the initial database schema.
 *
 * NOTE: I will continue modifying this migration until I deploy the first
 * "usable" version of the app.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema
        .createTable('classrooms', (table) => {
            table.string('classroom_id', 16).notNullable();
            // We'll store the hashed participation code in a format that sort of resembles
            // PHP's password_hash() function. Namely,
            // $scrypt$cost$salt$hash
            table.string('hashed_participation_code', 255).notNullable();

            table.primary(['classroom_id']);
        })
        .createTable('participants', (table) => {
            table.string('participant_id', 8).notNullable();
            table
                .string('classroom_id', 16)
                .references('classroom_id')
                .inTable('classrooms')
                .notNullable();
            table.timestamp('started_at', { useTz: true }).notNullable();
            table.boolean('consented_to_all').notNullable();

            table.primary(['participant_id']);
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
    return knex.schema.dropTable('classrooms').dropTable('participants').dropTable('answers');
};
