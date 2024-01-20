/**
 * Adds a `stage` column to the `participants` table,
 * as well as a participants assignments table.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return knex.schema
        .alterTable('participants', (table) => {
            table.string('stage', 32).notNullable().defaultTo('pre-questionnaire');
        })
        .createTable('participant_assignments', (table) => {
            table
                .string('participant_id', 8)
                .references('participant_id')
                .inTable('participants')
                .onDelete('CASCADE')
                .notNullable();
            table.string('exercise_id', 32).notNullable();

            table.string('condition', 16).notNullable();
            table.string('task', 16).notNullable();

            table.primary(['participant_id', 'exercise_id']);
        });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.dropTable('participant_assignments').alterTable('participants', (table) => {
        table.dropColumn('submitted_at');
    });
}
