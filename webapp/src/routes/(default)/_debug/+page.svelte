<script>
    import { CONDITIONS } from '$lib/types';

    export let data;
</script>

<header>
    <h1>Debug page</h1>
</header>

<h2>Welcome, {data.participantId ? data.participantId : 'guest'}!</h2>

<nav>
    <p>Jump quickly to…</p>
    <ol>
        <li><a href="/">Class selection</a></li>
        <!-- TODO: use current classroom: -->
        <li><a href="/information/TEST-CLASS">Information sheet</a></li>
        <li><a href="/consent/TEST-CLASS">Consent</a></li>
        <li><a href="/questionnaire">Questionnaire: Part 1</a></li>
        <li><a href="/briefing">Briefing</a></li>
        <li><a href="/editor">Editor experiment</a></li>
        <li><a href="/post-exercise-questionnaire">Post-task questionnaire</a></li>
        <li><a href="/final-questionnaire">Reflection questionnaire</a></li>
        <li><a href="/before-submit">Before submission page</a></li>
        <li><a href="/thanks">Study completion page</a></li>
    </ol>
    <h3>Debug pages</h3>
    <ul>
        <li><a href="/_debug/answers">Answers</a></li>
    </ul>

    <h3>Create test editor</h3>
    <form method="GET" action="/_debug/detached-editor">
        <label for="condition">Condition:</label>
        <select id="condition" name="condition">
            {#each CONDITIONS as condition}
                <option value={condition}>{condition}</option>
            {/each}
        </select>

        <label for="task-name">Task:</label>
        <select id="task-name" name="task">
            {#each data.taskNames as taskName}
                <option value={taskName}>{taskName}</option>
            {/each}
        </select>

        <button type="submit">Go!</button>
    </form>
</nav>

<form method="POST" action="?/debugResetParticipantId">
    <button type="submit" disabled={!data.participantId}> Clear participant_id cookie </button>
</form>
