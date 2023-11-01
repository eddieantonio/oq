import { db } from "$lib/server/database";

export const actions: import('./$types').Actions = {
    default: async ({ request }) => {
        const data = await request.formData();

        // create a question record for each thing in form data
        for (const [key, value] of data.entries()) {
            if (typeof value !== 'string') {
                console.error('Got a non-string value. Ignoring...');
                continue;
            }

            db.set(key, {
                question_id: key,
                answer: value,
            });
        }
    }
};