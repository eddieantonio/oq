import type { Participant } from '$lib/server/database';

// See https://kit.svelte.dev/docs/types#app
declare global {
    namespace App {
        interface Locals {
            participant?: Participant;
            /**
             * Returns the participant if they are logged in.
             * Throws an error if the participant is not logged in.
             */
            expectParticipant(): Participant;
        }
    }
}

export {};
