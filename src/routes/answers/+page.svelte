<script>
    export let data;
</script>

<header>
    <h1>Answers</h1>
</header>

<dl>
    {#each data.answers as answer}
        <dt><code>{answer.question_id}</code></dt>
        <dd>{answer.answer}</dd>
    {/each}
</dl>
