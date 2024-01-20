/**
 * Runs when the server starts.
 */

import { loadTasksSync } from '$lib/server/tasks';

loadTasksSync();
