import { redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

export const actions: import('./$types').Actions = {
    default: async () => {
        // TODO: store that the participant has COMPLETED the task
        throw redirect(StatusCodes.SEE_OTHER, '/thanks');
    }
};
