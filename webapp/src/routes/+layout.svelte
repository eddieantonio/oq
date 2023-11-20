<script lang="ts">
    import { dev } from '$app/environment';

    export let data;
</script>

<slot />

{#if dev}
    <footer class="debug-footer">
        <nav>
            <a href="/_debug">Go to debug page</a>
            <span>Logged in as {data.participantId ? data.participantId : 'guest'}</span>
        </nav>
    </footer>
{/if}

<style>
    footer {
        margin-block-start: 2rem;

        --bg: var(--nc-bg-3, #e5e7eb);
        --fg: var(--nc-tx-1, #000);
        --link: var(--nc-lk-1, #0070f3);
    }

    /* colors for dark mode */
    @media (prefers-color-scheme: dark) {
        footer {
            --bg: var(--nc-bg-3, #222);
            --fg: var(--nc-tx-1, #fff);
            --link: var(--nc-lk-1, #3291ff);
        }
    }

    nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;

        display: flex;
        justify-content: space-between;

        margin: 0;
        padding-inline: 1rem;
        padding-block: 1rem;

        font-size: small;

        color: var(--fg);
        background-color: var(--bg);
        opacity: 0.5;
        transition: opacity 0.2s ease-in-out;
    }
    nav:hover {
        opacity: 1;
    }

    a {
        color: var(--link);
    }
</style>
