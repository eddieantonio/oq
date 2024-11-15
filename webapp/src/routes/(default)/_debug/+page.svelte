<script lang="ts">
    import { browser } from '$app/environment';
    import ActionBar from '$lib/components/forms/ActionBar.svelte';
    import { CONDITIONS } from '$lib/types';

    export let data;
    const classroom = 'COMP1004J';

    let condition = initializeFromLocalStorage('condition');
    let task = initializeFromLocalStorage('task');

    $: setLocalStorage('condition', condition);
    $: setLocalStorage('task', task);

    function initializeFromLocalStorage(suffix: string): string | null {
        if (!browser) return null;
        return localStorage.getItem(key(suffix));
    }

    function setLocalStorage(suffix: string, value: string | null) {
        if (!browser) return;
        if (value == null) return;
        localStorage.setItem(key(suffix), value);
    }

    /** Prefix key with oq to avoid clashes with third-party browser extensions. */
    function key(suffix: string): string {
        return `oq:debug:${suffix}`;
    }
</script>

<header>
    <h1>Debug page</h1>
</header>

<h2>Welcome, {data.participantId ? data.participantId : 'guest'}!</h2>

<nav>
    <p>Jump quickly to…</p>
    <ol>
        <li><a href="/">Class selection</a></li>
        <li><a href="/information/{classroom}">Information sheet</a></li>
        <li><a href="/consent/{classroom}">Consent</a></li>
        <li><a href="/questionnaire">Questionnaire: Part 1</a></li>
        <li><a href="/briefing">Briefing</a></li>
        <li><a href="/editor">Editor experiment</a></li>
        <li><a href="/post-exercise-questionnaire">Post-task questionnaire</a></li>
        <li><a href="/final-questionnaire">Reflection questionnaire</a></li>
        <li><a href="/before-submit">Before submission page</a></li>
        <li><a href="/thanks">Study completion page</a></li>
    </ol>

    <h3>Create test editor</h3>
    <form method="GET" action="/_debug/detached-editor">
        <label for="condition">Condition:</label>
        <select id="condition" name="condition" bind:value={condition}>
            {#each CONDITIONS as condition}
                <option value={condition}>{condition}</option>
            {/each}
        </select>

        <label for="task-name">Task:</label>
        <select id="task-name" name="task" bind:value={task}>
            {#each data.taskNames as taskName}
                <option value={taskName}>{taskName}</option>
            {/each}
        </select>

        <button type="submit">Go!</button>
    </form>

    <h3>Set stage</h3>
    <form method="POST" action="?/setStage">
        <label for="stage">Stage: </label>
        <select id="stage" name="stage" value={data.participant?.stage}>
            {#each data.stages as stageName}
                <option value={stageName}>{stageName}</option>
            {/each}
        </select>
        <button type="submit" disabled={!data.participantId}> Set and navigate </button>
    </form>
</nav>

<ActionBar>
    <form method="POST" action="?/debugResetParticipantId">
        <button type="submit" disabled={!data.participantId}> Clear participant_id cookie </button>
    </form>
    <form method="POST" action="?/debugResetVoucher">
        <button type="submit" disabled={!data.voucher}> Clear voucher cookie </button>
    </form>
</ActionBar>
