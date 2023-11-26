/**
 * This migration adds the following tables:
 *
 * - exercise_attempts: Inserted when a participant started an exercise.
 * - completed_exercise_attempts: Inserted when a participant completed an exercise.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return (
        knex.schema
            .createTable('exercise_attempts', (table) => {
                table.comment('Inserted when a participant starts an exercise.');

                // Who attempted the exercise?
                table
                    .string('participant_id', 8)
                    .references('participant_id')
                    .inTable('participants')
                    .notNullable();
                // Which exercise?
                table.string('exercise_id', 32).notNullable();
                // What kind of error messages did they see?
                table.string('condition', 16).notNullable();
                // When did they start the exercise?
                table.timestamp('started_at', { useTz: true }).notNullable();

                table.primary(['participant_id', 'exercise_id']);
            })
            .createTable('completed_exercise_attempts', (table) => {
                table.comment('Inserted when an exercise is completed.');

                table.string('participant_id', 8).notNullable();
                table.string('exercise_id', 32).notNullable();
                // Reason can be 'submitted' | 'passed' | 'timed-out'
                table.string('reason', 16).notNullable();
                // When did they complete the exercise?
                table.timestamp('completed_at', { useTz: true }).notNullable();

                table.primary(['participant_id', 'exercise_id']);
                table
                    .foreign(['participant_id', 'exercise_id'])
                    .references(['participant_id', 'exercise_id'])
                    .inTable('exercise_attempts');
            })
            // This is an unideal way of doing it. But this allows for
            // compile events to OPTIONALLY be associated with an exercise.
            .createTable('exercise_compile_events', (table) => {
                table.comment('Associates a compile event with an exercise attempt.');

                table
                    .integer('compile_event_id')
                    .references('compile_event_id')
                    .inTable('compile_events')
                    .notNullable();
                table.string('participant_id', 8).notNullable();
                table.string('exercise_id', 32).notNullable();

                table.primary(['compile_event_id']);
                table
                    .foreign(['participant_id', 'exercise_id'])
                    .references(['participant_id', 'exercise_id'])
                    .inTable('exercise_attempts');
            })
    );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema
        .dropTable('exercise_compile_events')
        .dropTable('completed_exercise_attempts')
        .dropTable('exercise_attempts');
}
