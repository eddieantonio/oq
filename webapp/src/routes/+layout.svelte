<script lang="ts">
    import { dev } from '$app/environment';
    import { assets } from '$app/paths';

    export let data;
</script>

<svelte:head>
    <link rel="stylesheet" href="{assets}/new.min.css" />
</svelte:head>

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

        background-color: var(--nc-bg-3);
        opacity: 0.5;
        transition: opacity 0.2s ease-in-out;
    }

    nav:hover {
        opacity: 1;
    }
</style>
