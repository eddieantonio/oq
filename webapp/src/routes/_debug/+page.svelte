<script>
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
        <li><a href="/consent/TEST-CLASSROOM">Consent</a></li>
        <li><a href="/questionnaire">Questionnaire: Part 1</a></li>
        <li><a href="/briefing">Briefing</a></li>
        <li><a href="/editor">Editor experiment</a></li>
        <li><a href="/before-submit">Before submission page</a></li>
        <li><a href="/thanks">Study completion page</a></li>
    </ol>
    <h3>Debug pages</h3>
    <ul>
        <li><a href="/_debug/answers">Answers</a></li>
    </ul>
</nav>

<form method="POST" action="?/debugResetParticipantId">
    <button type="submit" disabled={!data.participantId}> Clear participant_id cookie </button>
</form>
