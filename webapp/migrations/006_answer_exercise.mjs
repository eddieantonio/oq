/**
 * Adds an `exercise_id` column to the `answers` table to (optionally) link an answer to an exercise.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return knex.schema.alterTable('answers', (table) => {
        table.string('exercise_id', 32).nullable();
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.alterTable('answers', (table) => {
        table.dropColumn('exercise_id');
    });
}
