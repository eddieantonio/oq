/**
 * My knex configuration. For now, it's all wrapped up in one (i.e., dev and production use the same config).
 *
 * Use DATABASE_PATH to customize the full path to the SQLite3 database file.
 * Use NODE_ENV to control debug output. It will be off in production.
 *
 * @type {import("knex").Knex.Config}
 */
export default {
    client: 'better-sqlite3',
    // Okay, so knex REALLY wants you to know that SQLite3 does not support
    // default values, so it practically FORCES you to set this option:
    useNullAsDefault: true,
    connection: {
        filename: process.env.DATABASE_PATH ?? './answers.sqlite3'
    },
    debug: process.env.NODE_ENV !== 'production',
    migrations: {
        directory: './migrations',
        loadExtensions: ['.mjs']
    }
};
