<script lang="ts">
    import LikertScale from '$lib/components/LikertScale.svelte';
    import ShortAnswer from '$lib/components/ShortAnswer.svelte';
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
            value="0"
        />
    </div>

    <div class="input-group">
        <label for="python-experience">How many years have you been programming in Python?</label>
        <input
            type="number"
            id="python-experience"
            name="python-experience"
            min="0"
            max="100"
            step="1"
            value="0"
        />
    </div>

    <!-- we'll come up with better widgets for likert scales later -->
    <LikertScale questionId="experience-likert">
        How would you rate your overall experience with programming?
    </LikertScale>

    <LikertScale questionId="python-familiarity-likert">
        How would you rate your overall familiarity with Python?
    </LikertScale>

    <ShortAnswer questionId="best-language">
        What programming language are you most experienced in?
    </ShortAnswer>

    <ShortAnswer questionId="favourite-ide">What is your favourite code editor or IDE?</ShortAnswer>

    <button type="submit">Submit</button>
</form>

<p>
    <small>
        (<a href="/_debug/answers">See the answers</a>)
    </small>
</p>
