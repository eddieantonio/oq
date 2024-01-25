const UUID_4_LENGTH = 36;
const SHA_256_LENGTH = 64;
const CLASSROOM_ID_LENGTH = 16;
const QUESTION_ID_LENGTH = 64;
const EXERCISE_ID_LENGTH = 32;

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
        .createTable('classrooms', (table) => {
            table.comment('Represents a cohort of participants');

            table.string('classroom_id', CLASSROOM_ID_LENGTH).notNullable();
            // We'll store the hashed participation code in a format that sort of resembles
            // PHP's password_hash() function. Namely,
            // $scrypt$cost$salt$hash
            table.string('hashed_participation_code', 255).notNullable();

            table.primary(['classroom_id']);
        })
        .createTable('participants', (table) => {
            table.comment('Represents a unique, anonymous participant in the study');

            // Currently, I'm storing these as UUIDv4s.
            table.string('participant_id', UUID_4_LENGTH).notNullable();
            table
                .string('classroom_id', CLASSROOM_ID_LENGTH)
                .references('classroom_id')
                .inTable('classrooms')
                // No CASCADE because I don't want to accidentally delete a classroom!
                .notNullable();

            // When did the participant start the study?
            table.timestamp('started_at', { useTz: true }).notNullable();
            // When did the participant submit the study?
            // I hate nullable columns, but it's the easiest thing to do here.
            table.timestamp('submitted_at', { useTz: true }).nullable();
            // What stage of the study is the participant in?
            table.string('stage', 32).notNullable();
            // Should always be true, but this is to force me to store it when creating a participant.
            table.boolean('consented_to_all').notNullable();

            table.primary(['participant_id']);
        })
        .createTable('snapshots', (table) => {
            table.comment('Stores the complete source code for a compilation event.');

            // A SHA-256 hash of the source code.
            table.string('snapshot_id', SHA_256_LENGTH).notNullable();
            table.binary('source_code').notNullable();

            table.primary(['snapshot_id']);
        })
        .createTable('answers', (table) => {
            table.comment("Stores the participant's answers to survey questions.");

            table
                .string('participant_id', UUID_4_LENGTH)
                .references('participant_id')
                .inTable('participants')
                .onDelete('CASCADE')
                .notNullable();
            table.string('question_id', QUESTION_ID_LENGTH).notNullable();
            table.string('answer', 1024).notNullable();

            // I hate nullable columns. Maybe a better way, approved by Boyce and Codd themselves
            // is to create two different tables for answers -- one with exercises and one without --
            // then create a view that unions them together.
            table.string('exercise_id', EXERCISE_ID_LENGTH).nullable();

            table.primary(['participant_id', 'question_id']);
        })
        .createTable('participant_assignments', (table) => {
            table.comment('Assigns a participant to their given tasks/conditions.');

            table
                .string('participant_id', UUID_4_LENGTH)
                .references('participant_id')
                .inTable('participants')
                .onDelete('CASCADE')
                .notNullable();
            table.string('exercise_id', EXERCISE_ID_LENGTH).notNullable();

            table.string('condition', 16).notNullable();
            table.string('task', 16).notNullable();

            table.primary(['participant_id', 'exercise_id']);
        })
        .createTable('exercise_attempts', (table) => {
            table.comment('Inserted when a participant starts an exercise.');

            // Who attempted the exercise?
            table
                .string('participant_id', UUID_4_LENGTH)
                .references('participant_id')
                .inTable('participants')
                .onDelete('CASCADE')
                .notNullable();
            // Which exercise?
            table.string('exercise_id', EXERCISE_ID_LENGTH).notNullable();
            // When did they start the exercise?
            table.timestamp('started_at', { useTz: true }).notNullable();

            table.primary(['participant_id', 'exercise_id']);
        })
        .createTable('completed_exercise_attempts', (table) => {
            table.comment('Inserted when an exercise is completed.');

            table.string('participant_id', UUID_4_LENGTH).notNullable();
            table.string('exercise_id', EXERCISE_ID_LENGTH).notNullable();
            // Reason can be 'submitted' | 'skipped' | 'timed-out'
            table.string('reason', 16).notNullable();
            // When did they complete the exercise?
            table.timestamp('completed_at', { useTz: true }).notNullable();

            table.primary(['participant_id', 'exercise_id']);
            table
                .foreign(['participant_id', 'exercise_id'])
                .references(['participant_id', 'exercise_id'])
                .inTable('exercise_attempts')
                .onDelete('CASCADE');
        })
        // For this compile_events and compile_outputs,
        // I am vaguely mirroring the names that Blackbox uses
        .createTable('compile_events', (table) => {
            table.comment('Inserted at the moment that a participant submits code.');

            table.increments('compile_event_id').notNullable();
            // Who submitted the code?
            table
                .string('participant_id', UUID_4_LENGTH)
                .references('participant_id')
                .inTable('participants')
                .onDelete('CASCADE')
                .notNullable();
            // When did they submit it?
            table.timestamp('submitted_at', { useTz: true }).notNullable();
            // What code did they submit? Note: multiple participants can submit identical code.
            table
                .string('snapshot_id', SHA_256_LENGTH)
                .references('snapshot_id')
                .inTable('snapshots')
                // No CASCADE because snapshots should never be deleted.
                .notNullable();

            table.primary(['compile_event_id']);
        })
        .createTable('compile_outputs', (table) => {
            table.comment('Inserted whenever the code execution engine returns.');

            table
                .increments('compile_event_id')
                .references('compile_event_id')
                .inTable('compile_events')
                .onDelete('CASCADE')
                .notNullable();
            // Did the code compile?
            table.boolean('success').notNullable();
            // Unlike Blackbox, I am storing the output as one big JSON blob,
            // rather than having a row per error.
            // Data normalization is future Eddie's problem.
            table.json('compile_errors');

            table.primary(['compile_event_id']);
        })
        // This is an unideal way of doing it. But this allows for
        // compile events to OPTIONALLY be associated with an exercise.
        .createTable('exercise_compile_events', (table) => {
            table.comment('Associates a compile event with an exercise attempt.');

            table
                .integer('compile_event_id')
                .references('compile_event_id')
                .inTable('compile_events')
                .onDelete('CASCADE')
                .notNullable();
            table.string('participant_id', UUID_4_LENGTH).notNullable();
            table.string('exercise_id', EXERCISE_ID_LENGTH).notNullable();

            table.primary(['compile_event_id']);
            table
                .foreign(['participant_id', 'exercise_id'])
                .references(['participant_id', 'exercise_id'])
                .inTable('exercise_attempts')
                .onDelete('CASCADE');
        });

    await knex.raw(`
CREATE VIEW analyzable_exercise_attempts AS
SELECT
	participant_id,
	exercise_id,
	task,
	\`condition\`,
	reason,
	(completed_at - started_at) / 1000.0 as time_to_complete
FROM
	exercise_attempts ea
		INNER JOIN completed_exercise_attempts cea USING (participant_id, exercise_id)
		INNER JOIN participant_assignments pa USING (participant_id, exercise_id);`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.raw(`DROP VIEW IF EXISTS analyzable_exercise_attempts;`);
    await knex.schema
        .dropTable('exercise_compile_events')
        .dropTable('compile_outputs')
        .dropTable('compile_events')
        .dropTable('completed_exercise_attempts')
        .dropTable('exercise_attempts')
        .dropTable('participant_assignments')
        .dropTable('answers')
        .dropTable('snapshots')
        .dropTable('participants')
        .dropTable('classrooms');
};
