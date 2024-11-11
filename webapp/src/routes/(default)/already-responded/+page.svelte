<script lang="ts">
    import Voucher from '$lib/components/Voucher.svelte';

    export let data;
    const { voucher } = data;
</script>

<header>
    <h1>You've already responded</h1>
</header>

<p>You can only do this study once.</p>

{#if voucher != null}
    <Voucher {voucher} />
{/if}

<p>
    If you have any questions, please feel free to email the head researcher at <a
        href="mailto:eddie.santos@ucdconnect.ie">eddie.santos@ucdconnect.ie</a
    >.
</p>
