<script>
    export let data;
</script>

<header>
    <h1>Answers</h1>
</header>

<table>
    <thead>
        <tr>
            <th>Participant ID</th>
            <th>Question ID</th>
            <th>Answer</th>
        </tr>
    </thead>
    <tbody>
        {#each data.answers as answer}
            <tr>
                <td>{answer.participant_id}</td>
                <td>{answer.question_id}</td>
                <td>{answer.answer}</td>
            </tr>
        {/each}
    </tbody>
</table>
