<script>
    import ActionBar from '$lib/components/forms/ActionBar.svelte';
    import Voucher from '$lib/components/Voucher.svelte';
    export let data;
</script>

<header>
    <h1>Almost done…</h1>
</header>

<article>
    <Voucher voucher={data.voucher} />

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
