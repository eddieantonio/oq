/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // add column participants.submitted_at
    return knex.schema.alterTable('participants', (table) => {
        // I hate nullable columns, but here it's the easiest thing to do.
        table.timestamp('submitted_at', { useTz: true });
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.alterTable('participants', (table) => {
        table.dropColumn('submitted_at');
    });
}
