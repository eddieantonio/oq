<script lang="ts">
    import { onMount } from 'svelte';
    import JSConfetti from 'js-confetti';

    import Voucher from '$lib/components/Voucher.svelte';

    export let data;

    onMount(() => {
        let jsConfetti = new JSConfetti();
        jsConfetti.addConfetti();
    });
</script>

<header>
    <h1>You're done!</h1>
</header>

<h2>Thank you for completing our study!</h2>

<p>
    Your submission helps develop our understanding of how people interact with error messages. We
    greatly appreciate your time.
</p>

<p>
    If you have any questions, please feel free to email the head researcher at <a
        href="mailto:eddie.santos@ucdconnect.ie">eddie.santos@ucdconnect.ie</a
    >.
</p>

{#if data.voucher}
    <Voucher voucher={data.voucher} />
{/if}

<p>Submit this vocuher as directed by your instructor. After that, it is safe to close this tab.</p>
