import type { Participant } from '$lib/server/database';

// See https://kit.svelte.dev/docs/types#app
declare global {
    namespace App {
        interface Locals {
            participant?: Participant;
        }
    }
}

export {};
