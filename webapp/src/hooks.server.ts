/**
 * Runs when the server starts.
 */

import { loadTasks } from '$lib/server/tasks';

init().catch((err) => {
    console.error(err);
    process.exit(1);
});

async function init() {
    await loadTasks();
}
