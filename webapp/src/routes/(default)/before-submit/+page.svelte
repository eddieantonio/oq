<script>
    import ActionBar from '$lib/components/forms/ActionBar.svelte';
</script>

<header>
    <h1>Almost done…</h1>
</header>

<article>
    <p>
        Heads up! <strong class="warning"
            >This is your last chance to change opt out of data collection</strong
        >. Remember, all data is collected anonymously and will be used for research purposes only.
    </p>
    <p>
        <strong
            >When you press “Submit”, your study data will be permanently stored in our database.</strong
        >
    </p>

    <form method="POST">
        <ActionBar>
            <button type="submit" name="status" value="revoke-consent">
                Opt out of data collection
            </button>
            <button type="submit" name="status" value="consent"> Submit </button>
        </ActionBar>
    </form>
</article>

<style>
    .warning {
        color: red;
    }

    button[value='revoke-consent'] {
        background-color: red;
    }
</style>
