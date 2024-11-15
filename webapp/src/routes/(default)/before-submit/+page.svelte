<script>
    import ActionBar from '$lib/components/forms/ActionBar.svelte';
</script>

<header>
    <h1>Almost done…</h1>
</header>

<article>
    <p>
        Heads up! <strong class="warning"
            >This is your last chance to opt out of data collection</strong
        >. Remember, all data is collected anonymously and will be used for research purposes only.
        The only data that we will store will be your survey answers and some interaction data when
        you were writing code.
    </p>

    <p>
        <strong
            >When you press “Finish”, your study data will be stored in our database for a period of
            five years.</strong
        >
    </p>

    <p>
        Regardless of what you pick, your voucher will be on the next page.
    </p>

    <form method="POST">
        <ActionBar>
            <button type="submit" name="status" value="revoke-consent">
                Opt out of data collection
            </button>
            <button type="submit" name="status" value="consent"> Finish </button>
        </ActionBar>
    </form>
</article>

<style>
    .warning {
        color: red;
    }

    button {
        font-size: larger;
    }

    button[value='revoke-consent'] {
        margin-inline-end: auto;
        background-color: grey;
    }
</style>
