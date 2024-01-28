<script lang="ts">
    import { page } from '$app/stores';
    import ActionBar from '$lib/components/forms/ActionBar.svelte';
</script>

{#if $page.error && $page.error.reason === 'invalid-participation-code'}
    <header>
        <h1>Incorrect participation code</h1>
    </header>
    <p>You provided the wrong participation code. Check for typos and try again.</p>
    <ActionBar>
        <button on:click={() => window.history.back()}>Back</button>
    </ActionBar>
{:else}
    <h1>Something went wrong</h1>
    {$page.status}: {$page.error}
{/if}
