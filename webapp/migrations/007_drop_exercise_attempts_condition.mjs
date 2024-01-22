/**
 * Drop the condition column from the exercise_attempts table.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // The whole reason I used Knex in the first place was so that I could have
    // a database-agnostic way of creating tables. But now I'm using raw SQL ¯\_(ツ)_/¯
    await knex.raw('ALTER TABLE exercise_attempts DROP COLUMN condition');
}

export async function down() {
    throw new Error('Down migrations not supported');
}
