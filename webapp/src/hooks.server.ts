/**
 * Runs when the server starts.
 */

import path from 'path';
import { fileURLToPath } from 'url';

import { error, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

import { loadTasksSync } from '$lib/server/tasks';
import { getParticipantPossiblyUndefined } from '$lib/server/database';
import type { ParticipantId } from '$lib/server/newtypes';
import { StatusCodes } from 'http-status-codes';

// Loads all the tasks on server start.
// If you change the files in webapp/tasks, you need to restart the server!

if (!building) loadTasksSync(currentTasksDir());

/**
 * Loads the participant into EVERY page when logged in.
 */
export const handle: Handle = async ({ event, resolve }) => {
    const participantId = event.cookies.get('participant_id');

    if (participantId) {
        const participant = await getParticipantPossiblyUndefined(participantId as ParticipantId);
        if (!participant) throw error(400, 'Invalid participant ID');
        event.locals.expectParticipant = () => participant;
    } else {
        event.locals.expectParticipant = (message: string | undefined) => {
            throw error(StatusCodes.UNAUTHORIZED, message ?? 'Must be logged in for this page');
        };
    }

    // Continue normal processing:
    return await resolve(event);
};

/**
 * If the TASK_DIR environment variable is defined, load tasks from that
 * directory. Otherwise, load from a hard-coded path that is only guaranteed to
 * work in development.
 */
function currentTasksDir(): string {
    if (env.TASK_DIR) return env.TASK_DIR;

    const here = path.dirname(fileURLToPath(import.meta.url));
    return path.resolve(`${here}/../tasks`);
}
