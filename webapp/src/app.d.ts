// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        interface Error {
            reason?: 'invalid-participation-code';
        }
        // Note: Locals is defined in src/lib/server/app.d.ts
        // since it only makes sense on the server-side anyway.
    }
}

export {};
