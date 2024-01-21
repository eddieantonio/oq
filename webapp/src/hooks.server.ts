/**
 * Runs when the server starts.
 */

import path from 'path';
import { fileURLToPath } from 'url';

import { error, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';

import { loadTasksSync } from '$lib/server/tasks';
import { getParticipantPossiblyUndefined } from '$lib/server/database';
import type { ParticipantId } from '$lib/server/newtypes';

// Loads all the tasks on server start.
// If you change the files in webapp/tasks, you need to restart the server!

// TODO: do some env bullcrap
// so that tasks are loaded from /app/tasks on server load
if (!building) loadTasksSync(currentTasksDir());

/**
 * Loads the participant into EVERY page when logged in.
 */
export const handle: Handle = async ({ event, resolve }) => {
    const participantId = event.cookies.get('participant_id');

    if (participantId) {
        const participant = await getParticipantPossiblyUndefined(participantId as ParticipantId);
        if (!participant) throw error(400, 'Invalid participant ID');
        event.locals.participant = participant;
    }

    // Continue normal processing:
    return await resolve(event);
};

function currentTasksDir(): string {
    const here = path.dirname(fileURLToPath(import.meta.url));
    return path.resolve(`${here}/../tasks`);
}
