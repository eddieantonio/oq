<script>
    import ActionBar from '$lib/components/forms/ActionBar.svelte';
</script>

<header>
    <h1>Almost done…</h1>
</header>

<article>
    <p>
        <strong>EDDIE:</strong> write some copy here that warns the participant this this is the point
        of no return. They should be reminded that their response will be stored ANONYMOUSLY and I will
        be unable to associate their data with them beyond this point.
    </p>
    <p>You will not be able to unsubmit. Final answers!</p>

    <form method="POST">
        <ActionBar>
            <button type="submit" name="status" value="revoke-consent"> Revoke consent </button>
            <button type="submit" name="status" value="consent"> Submit </button>
        </ActionBar>
    </form>
</article>

<style>
    strong {
        color: red;
    }

    button[value='revoke-consent'] {
        background-color: red;
    }
</style>
