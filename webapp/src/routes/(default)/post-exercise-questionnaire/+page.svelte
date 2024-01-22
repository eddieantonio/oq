<script lang="ts">
    import { dev } from '$app/environment';

    import ActionBar from '$lib/components/forms/ActionBar.svelte';
    import DiagnosticDisplay from '$lib/components/DiagnosticDisplay.svelte';
    import LikertScale from '$lib/components/forms/LikertScale.svelte';

    export let data;
    const pem = data.pem;

    // I changed my mind: 5-point Likert
    const labels = [
        'Strongly disagree',
        'Somewhat disagree',
        'Neutral',
        'Somewhat agree',
        'Strongly agree'
    ];
</script>

<!-- This is the questionnaire for now. Eventually I will refactor this to have its own page. -->
<h1>You just saw this error message:</h1>
<blockquote>
    <DiagnosticDisplay diagnostics={pem} />
</blockquote>

<h2>Please rate your agreement with the following statements:</h2>
<form method="post">
    <LikertScale questionId="understand-positive" {labels}>
        This error message helped me understand what was wrong with the code
    </LikertScale>

    <LikertScale questionId="understand-negative" {labels}>
        This error message was hard to understand
    </LikertScale>

    <LikertScale questionId="read-positive" {labels}>
        I read the error message in its entirety
    </LikertScale>

    <LikertScale questionId="read-negative" {labels}>I skimmed the error message</LikertScale>

    <LikertScale questionId="quality-negative" {labels}>
        This error message was poorly written
    </LikertScale>

    <LikertScale questionId="quality-postive" {labels}>
        It was worth reading this error message
    </LikertScale>

    <LikertScale questionId="future-postive" {labels}>
        I would find this error message useful in the future
    </LikertScale>

    <LikertScale questionId="future-negative" {labels}>
        I do not want to see this kind of error message in the future
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
