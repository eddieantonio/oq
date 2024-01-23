<script lang="ts">
    import { dev } from '$app/environment';

    import ActionBar from '$lib/components/forms/ActionBar.svelte';
    import DiagnosticDisplay from '$lib/components/DiagnosticDisplay.svelte';
    import LongAnswer from '$lib/components/forms/LongAnswer.svelte';
    import LikertGroup from '$lib/components/forms/LikertGroup.svelte';

    export let data;
    const pem = data.pem;
</script>

<!-- This is the questionnaire for now. Eventually I will refactor this to have its own page. -->
<h1>You just saw this error message:</h1>
<blockquote>
    <DiagnosticDisplay diagnostics={pem} />
</blockquote>

<form method="post">
    <LikertGroup
        questions={[
            {
                questionId: 'understand-positive',
                label: 'This error message helped me understand what was wrong with the code'
            },
            {
                questionId: 'understand-negative',
                label: 'This error message was hard to understand'
            },
            {
                questionId: 'read-negative',
                label: 'I skimmed the error message'
            },
            {
                questionId: 'read-positive',
                label: 'I read the error message in its entirety'
            },
            {
                questionId: 'quality-postive',
                label: 'It was worth reading this error message'
            },
            {
                questionId: 'quality-negative',
                label: 'This error message was poorly written'
            },
            {
                questionId: 'future-negative',
                label: 'I do not want to see this kind of error message in the future'
            },
            {
                questionId: 'future-postive',
                label: 'I would find this error message useful in the future'
            }
        ]}
    >
        Please rate your agreement with the following statements:
    </LikertGroup>

    <LongAnswer questionId="elaboration">
        Could you explain your answers above? (optional)
    </LongAnswer>

    <ActionBar>
        <button type="submit">Submit</button>
    </ActionBar>
</form>

{#if dev}
    <p>
        <small>
            (<a href="/_debug/answers">See the answers</a>)
        </small>
    </p>
{/if}
