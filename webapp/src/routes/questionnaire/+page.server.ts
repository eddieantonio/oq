import { saveAnswer } from '$lib/server/database';
import type { ParticipantId } from '$lib/server/participants';

export const actions: import('./$types').Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();

        // create a question record for each thing in form data
        for (const [key, value] of data.entries()) {
            if (typeof value !== 'string') {
                console.error('Got a non-string value. Ignoring...');
                continue;
            }

            const who = cookies.get('participant_id') as ParticipantId;
            await saveAnswer({
                participant_id: who,
                question_id: key,
                answer: value
            });
        }
    }
};
