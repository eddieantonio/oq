<script lang="ts">
    import { dev } from '$app/environment';
    import ActionBar from '$lib/components/forms/ActionBar.svelte';

    import LongAnswer from '$lib/components/forms/LongAnswer.svelte';
    import MultipleChoice from '$lib/components/forms/MultipleChoice.svelte';
    import ShortAnswer from '$lib/components/forms/ShortAnswer.svelte';
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
        choices={['None', 'Very little', 'Some', 'A good deal', 'A lot', 'Extensive']}
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
        What do you feel is your level of proficiency with programming
    </MultipleChoice>

    <div class="input-group">
        <h2>
            When you are working on code and you see an error message, what is your usual reaction?
            (select all that apply)
        </h2>
        <label
            ><input type="checkbox" name="reaction" value="panic" /> Panic, I don’t know what to do with
            this and I don’t understand it</label
        >
        <label
            ><input type="checkbox" name="reaction" value="completely-ignore" />
            I completely ignore it and continue writing code hoping for the best</label
        >
        <label
            ><input type="checkbox" name="reaction" value="ignore" /> I ignore the actual message but
            look for the line it tells me I have a problem</label
        >
        <label
            ><input type="checkbox" name="reaction" value="read-1" /> I read the message but I don’t
            always understand what it means</label
        >
        <label
            ><input type="checkbox" name="reaction" value="read-2" /> I read the message and try to understand
            what it’s telling me</label
        >
        <label
            ><input type="checkbox" name="reaction" value="read-3" /> I read the message and try to understand
            what the problem is and on what line</label
        >
        <label
            ><input type="checkbox" name="reaction" value="read-4" /> I read the message and follow the
            suggested fix</label
        >
    </div>

    <div class="input-group">
        <h2>
            When you are dealing with an error message, where are you most likely to seek help?
            (select all that apply)
        </h2>
        <label
            ><input type="checkbox" name="seeking-help" value="nowhere-1" /> Nowhere, I just keep trying
            things and see what works</label
        >
        <label
            ><input type="checkbox" name="seeking-help" value="nowhere-2" /> Nowhere, the programming
            environment tells me exactly what I need to do to fix it</label
        >
        <label
            ><input type="checkbox" name="seeking-help" value="textbook" /> I look in the textbook</label
        >
        <label
            ><input type="checkbox" name="seeking-help" value="web-search" /> I search on the web (e.g.
            Google, Bing, Yahoo, etc.) and look for an explanation of what the error message means</label
        >
        <label
            ><input type="checkbox" name="seeking-help" value="web-forums" /> I search on the web and
            follow the links to forums like StackOverflow or CSDN looking for fixes that worked for others</label
        >
        <label
            ><input type="checkbox" name="seeking-help" value="instructor" /> I ask my Instructor / Professor</label
        >
        <label
            ><input type="checkbox" name="seeking-help" value="ta" /> I ask my Teaching Assistant / Tutor</label
        >
        <label
            ><input type="checkbox" name="seeking-help" value="classmates" /> I ask my classmates</label
        >
        <label
            ><input type="checkbox" name="seeking-help" value="experienced-friends" /> I ask my more
            experienced friends</label
        >
        <label
            ><input type="checkbox" name="seeking-help" value="ai" /> I ask A.I. like ChatGPT, GitHub
            Copilot etc.</label
        >
    </div>

    <LongAnswer questionId="general-feeling">
        How do you feel about programming error messages in general?
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

<style>
    .input-group > label {
        display: block;
    }
</style>
