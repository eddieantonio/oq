import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    },
    server: {
        // For use as the development server within Docker,
        // we need to accept connections from all addresses:
        host: true,
        // 3000 is what node HTTP servers typically use.
        // (vite defaults to 5173 (for some reason), but unfortunately differs
        // from what is used in production)
        port: 3000,
        // on macOS, sometimes multiple apps will bind to the same port. This
        // prevents that from happening, however, it will not prevent it the
        // port is being accessed via Docker:
        strictPort: true
    }
});
