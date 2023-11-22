/**
 * This migration adds the following tables:
 *
 *  - compile_events: A record of when a participant submitted code.
 *  - snapshots: A record of the source code participants submitted.
 *  - compile_results: A record of whether the code compiled, and if not, what errors were encountered.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return (
        knex.schema
            .createTable('snapshots', (table) => {
                // A SHA-256 hash of the source code.
                table.string('snapshot_id', 64).notNullable();
                table.binary('source_code').notNullable();

                table.primary(['snapshot_id']);
            })
            // For this compile_events and compile_outputs,
            // I am vaguely mirroring the names that Blackbox uses
            .createTable('compile_events', (table) => {
                table.increments('compile_event_id').notNullable();
                // Who submitted the code?
                table
                    .string('participant_id', 8)
                    .references('participant_id')
                    .inTable('participants')
                    .notNullable();
                // When did they submit it?
                table.timestamp('submitted_at', { useTz: true }).notNullable();
                // What code did they submit? Note: multiple participants can submit identical code.
                table
                    .string('snapshot_id', 64)
                    .references('snapshot_id')
                    .inTable('snapshots')
                    .notNullable();

                table.primary(['compile_event_id']);
            })
            .createTable('compile_outputs', (table) => {
                table
                    .increments('compile_event_id')
                    .references('compile_event_id')
                    .inTable('compile_events')
                    .notNullable();
                // Did the code compile?
                table.boolean('success').notNullable();
                // Unlike Blackbox, I am storing the output as one big JSON blob,
                // rather than having a row per error.
                // Data normalization is future Eddie's problem.
                table.json('compile_errors');

                table.primary(['compile_event_id']);
            })
    );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema
        .dropTable('snapshots')
        .dropTable('compile_outputs')
        .dropTable('compile_events');
}
