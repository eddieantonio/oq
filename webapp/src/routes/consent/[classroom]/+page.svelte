<script lang="ts">
    import type { PageData } from './$types';
    import ConsentCheckbox from '$lib/components/ConsentCheckbox.svelte';

    export let data: PageData;

    let style: 'checkbox' | 'bullet' = 'bullet';

    let participation = false;
    let questionnaire = false;
    let pseudonymised = false;
    let dataCollection = false;
    let interactionLogged = false;
    let dataUsage = false;
    $: consentedToAll =
        style == 'bullet' ||
        (participation &&
            questionnaire &&
            pseudonymised &&
            dataCollection &&
            interactionLogged &&
            dataUsage);

    // Use Intl to format the date in the Irish locale
    const today = new Intl.DateTimeFormat('en-IE', { dateStyle: 'short' }).format(new Date());
</script>

<header>
    <h1>Adult participation consent form</h1>
</header>

<form method="POST">
    <input type="hidden" name="classroom" value={data.classroom} />
    <input type="hidden" name="consentedToAll" value={consentedToAll} />

    <p>I consent to the following:</p>

    <ul class:remove-padding={style == 'checkbox'}>
        <ConsentCheckbox {style} name="participation" bind:value={participation}>
            I have read this information sheet and have had time to consider whether to take part in
            the data collection. I understand that my participation is voluntary (it is my choice)
            and that I am free to withdraw from the research up until I submit this form without
            disadvantage. I agree to take part in this research.
        </ConsentCheckbox>

        <ConsentCheckbox {style} name="questionnaire" bind:value={questionnaire}>
            I understand that, as part of this research project, I will be asked to take part in a
            questionnaire as well as take part in a programming task with a code editor that logs my
            activity, including the source code that I write.
        </ConsentCheckbox>

        <ConsentCheckbox {style} name="pseudonymised" bind:value={pseudonymised}>
            I understand that my name will not be identified in any way and that the data generated
            by me will be appropriately anonymised during the data collection.
        </ConsentCheckbox>

        <ConsentCheckbox {style} name="data-collection" bind:value={dataCollection}>
            I am voluntarily agreeing to have my data collected through this application and stored
            in encrypted laptop devices for the duration of the study.
        </ConsentCheckbox>

        <ConsentCheckbox {style} name="interaction-logged" bind:value={interactionLogged}>
            I am voluntarily agreeing to have my interaction with the code editor logged only during
            the programming task and later stored in encrypted laptop devices for the duration of
            the study.
        </ConsentCheckbox>

        <ConsentCheckbox {style} name="data-usage" bind:value={dataUsage}>
            I agree that the data can be used in publication of higher degrees and scientific
            publications.
        </ConsentCheckbox>
    </ul>

    <p>Signed: {today}</p>

    {#if style == 'checkbox'}
        <button type="submit" disabled={!consentedToAll}>Continue</button>
    {:else}
        <button type="submit">I agree to all of the above</button>
    {/if}
</form>

<style>
    .remove-padding {
        padding-inline: 0;
    }
</style>
