<script>
    export let data;
</script>

<header>
    <h1>Debug page</h1>
</header>

<h2>Welcome, {data.participantId ? data.participantId : 'guest'}!</h2>

<nav>
    <p>Jump quickly to&hellip;</p>
    <ul>
        <li><a href="/answers">Answers</a></li>
        <li><a href="/consent">Consent</a></li>
        <li><a href="/questionnaire">Questionnaire</a></li>
    </ul>
</nav>

<hr />

<form method="POST" action="?/debugResetParticipantId">
    <button type="submit" disabled={!data.participantId}> Clear participant_id cookie </button>
</form>
