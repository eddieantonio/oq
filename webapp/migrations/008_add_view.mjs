/**
 * Add view for ease of data analysis.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.raw(`
CREATE VIEW valid_exercise_attempts AS
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
}

/**
 * Add view for ease of data analysis.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.raw(`DROP VIEW IF EXISTS exercise_attempt_durations;`);
}
