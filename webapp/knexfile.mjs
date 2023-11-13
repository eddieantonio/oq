// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
    client: 'better-sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: './answers.sqlite3'
    },
    migrations: {
        directory: './migrations',
        loadExtensions: ['.mjs']
    }
};
