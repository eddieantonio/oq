<script lang="ts">
    import { dev } from '$app/environment';
    import ActionBar from '$lib/components/ActionBar.svelte';

    import LikertScale from '$lib/components/LikertScale.svelte';
    import ShortAnswer from '$lib/components/ShortAnswer.svelte';

    const studyLanguage = 'C';

    // Use this to put an upper-bound on the study language experience.
    let totalExperience = 0;
</script>

<!-- This is the questionnaire for now. Eventually I will refactor this to have its own page. -->
<h1>Questionnaire</h1>

<form method="post">
    <h2>Part 1: Programming experience</h2>

    <div class="input-group">
        <label for="experience">How many years have you been programming?</label>
        <input
            type="number"
            id="experience"
            name="experience"
            min="0"
            max="100"
            step="1"
            bind:value={totalExperience}
        />
    </div>

    <div class="input-group">
        <label for="study-lang-experience"
            >How many years have you been programming in {studyLanguage}?</label
        >
        <input
            type="number"
            id="study-lang-experience"
            name="study-lang-experience"
            min="0"
            max={totalExperience}
            step="1"
            value="0"
        />
    </div>

    <LikertScale
        questionId="experience-likert"
        labels={['Complete Beginner', '', '', 'Intermediate', '', '', 'Expert']}
    >
        How would you rate your overall experience with programming?
    </LikertScale>

    <LikertScale
        questionId="study-lang-familiarity-likert"
        labels={['Complete Beginner', '', '', 'Intermediate', '', '', 'Expert']}
    >
        How would you rate your overall familiarity with {studyLanguage}?
    </LikertScale>

    <ShortAnswer questionId="best-language">
        What programming language are you most experienced in?
    </ShortAnswer>

    <ShortAnswer questionId="favourite-ide">What is your favourite code editor or IDE?</ShortAnswer>

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
