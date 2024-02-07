/** Copy-pasted from initial migration. */
const CLASSROOM_ID_LENGTH = 16;

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
    await knex.schema
        .createTable('classroom_state', (table) => {
            table.comment('Maintains state for classroom participant generation.');

            table
                .string('classroom_id', CLASSROOM_ID_LENGTH)
                .references('classroom_id')
                .inTable('classrooms')
                .notNullable();

            // A JSON blob that represents the state of the classroom.
            // The contents? Don't worry about it. It's a secret. 🤫
            table.json('state');

            table.primary(['classroom_id']);
        })
        .alterTable('classrooms', (table) => {
            // Human-readable name for the classroom.
            table.string('name', 255).notNullable().defaultTo('<unnamed classroom>');
            // Should we allow submissions for this classroom?
            table.boolean('is_allowing_submissions').notNullable().defaultTo(true);
        });

    // Now change all existing classrooms to use their classroom_id as their name.
    await knex('classrooms').update({ name: knex.raw('classroom_id') });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema
        .alterTable('classrooms', (table) => {
            table.dropColumn('name');
            table.dropColumn('is_allowing_submissions');
        })
        .dropTable('classroom_state');
};
