<script lang="ts">
    import { dev } from '$app/environment';

    import ActionBar from '$lib/components/forms/ActionBar.svelte';
    import DiagnosticDisplay from '$lib/components/DiagnosticDisplay.svelte';
    import LikertScale from '$lib/components/forms/LikertScale.svelte';

    export let data;
    const pem = data.pem;

    const helpfullnessLabels = [
        'Not at all helpful',
        'Not very helpful',
        'Somehwat unhelpful',
        'Neutral',
        'Somewhat helpful',
        'Very helpful',
        'Extremely helpful'
    ];
</script>

<!-- This is the questionnaire for now. Eventually I will refactor this to have its own page. -->
<h1>Post-questionnaire</h1>

<p>You just saw this error message:</p>
<blockquote>
    <DiagnosticDisplay diagnostics={pem} />
</blockquote>

<form method="post">
    <LikertScale questionId="control-error-helpfulness" labels={helpfullnessLabels}>
        How helpful did you find this error messages?
    </LikertScale>

    <div class="input-group">
        <label for="control-explanation">Could you explain your answers above? (optional)</label>
        <textarea id="control-explanation" name="control-explanation" rows="4" cols="50" />
    </div>

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
