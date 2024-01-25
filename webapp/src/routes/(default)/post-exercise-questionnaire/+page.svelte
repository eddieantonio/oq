<script lang="ts">
    import { dev } from '$app/environment';

    import ActionBar from '$lib/components/forms/ActionBar.svelte';
    import DiagnosticDisplay from '$lib/components/DiagnosticDisplay.svelte';
    import LongAnswer from '$lib/components/forms/LongAnswer.svelte';
    import LikertGroup from '$lib/components/forms/LikertGroup.svelte';
    import LikertScale from '$lib/components/forms/LikertScale.svelte';

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
                questionId: 'fix-negative',
                label: 'This error message was useless for fixing the code'
            },
            {
                questionId: 'understand-negative',
                label: 'This error message was difficult to understand'
            },
            {
                questionId: 'fix-postive',
                label: 'This error message helped me fix the code'
            }
        ]}
    >
        Please rate your agreement with the following statements:
    </LikertGroup>

    <LikertScale
        questionId="length"
        labels={[
            'Way too short',
            'Slightly too short',
            'Just right',
            'Slightly too long',
            'Way too long'
        ]}
    >
        How was the length of this error message?
    </LikertScale>

    <LongAnswer questionId="elaboration" optional>Could you explain your answers above?</LongAnswer>

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
