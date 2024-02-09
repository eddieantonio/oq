<script lang="ts">
    import { dev } from '$app/environment';
    import ActionBar from '$lib/components/forms/ActionBar.svelte';
    import Checkboxes from '$lib/components/forms/Checkboxes.svelte';
    import FormGroup from '$lib/components/forms/FormGroup.svelte';
    import Gender from '$lib/components/forms/Gender.svelte';

    import LongAnswer from '$lib/components/forms/LongAnswer.svelte';
    import MultipleChoice from '$lib/components/forms/MultipleChoice.svelte';
    import ShortAnswer from '$lib/components/forms/ShortAnswer.svelte';

    let gender: string;
    let preferToSelfDescribe: string = '';
    $: submittedGender = gender == 'self-describe' ? preferToSelfDescribe : gender;
</script>

<h1>Error Message and you</h1>

<form method="post">
    <!-- These questions (mostly) mirror the student survey here: -->
    <!-- https://forms.office.com/r/bHbGP9WRN7 -->

    <!-- Question 1 on the student survey asks which course/module -- but we know that already :) -->

    <ShortAnswer questionId="ide">
        What IDE / compiler / environment are you personally using for this module? (PyCharm,
        Jupyter Notebooks, BlueJ, Eclipse, Netbeans, VS Code, etc.)
    </ShortAnswer>

    <MultipleChoice
        questionId="programming-experience"
        choices={[
            'None',
            'Very little (0-3 months)',
            'Some (3-6 months)',
            'A good deal (6-12 months)',
            'A lot (1-2 years)',
            'Extensive (2+ years)'
        ]}
    >
        Before this module, how much prior programming experience did you have?
    </MultipleChoice>

    <MultipleChoice
        questionId="programming-proficiency"
        choices={[
            'Complete novice - just learning programming now for the first time',
            'Advanced beginner - some prior experience with programming, but not too much',
            'Competent - I can write simple programs',
            'Proficient - I can write more complex programs',
            'Expert - I can write any program'
        ]}
    >
        What do you feel is your level of proficiency with programming?
    </MultipleChoice>

    <Checkboxes
        questionId="reaction"
        options={[
            'Panic, I don’t know what to do with this and I don’t understand it',
            'I completely ignore it and continue writing code hoping for the best',
            'I ignore the actual message but look for the line it tells me I have a problem',
            'I read the message but I don’t always understand what it means',
            'I read the message and try to understand what it’s telling me',
            'I read the message and try to understand what the problem is and on what line',
            'I read the message and follow the suggested fix'
        ]}
    >
        When you are working on code and you see an error message, what is your usual reaction?
        (select all that apply)
    </Checkboxes>

    <Checkboxes
        questionId="seeking-help"
        options={[
            'Nowhere, I just keep trying things and see what works',
            'Nowhere, I read the message and try to use it to fix the problem',
            'Nowhere, the programming environment tells me exactly what I need to do to fix it',
            'I look in the textbook',
            'I search on the web (e.g. Google, Bing, Yahoo, etc.) and look for an explanation of what the error message means',
            'I search on the web and follow the links to forums like StackOverflow or CSDN looking for fixes that worked for others',
            'I ask my Instructor / Professor',
            'I ask my Teaching Assistant / Tutor',
            'I ask my classmates',
            'I ask my more experienced friends',
            'I ask A.I. like ChatGPT, GitHub Copilot etc.'
        ]}
    >
        When you are dealing with an error message, where are you most likely to seek help? (select
        all that apply)
    </Checkboxes>

    <LongAnswer questionId="general-feeling">
        How do you feel about programming error messages in general?
    </LongAnswer>

    <h3>Demographics</h3>

    <Gender>Gender: how do you identify?</Gender>

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
