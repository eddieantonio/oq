<script lang="ts">
    export let voucher: string;

    async function copyVoucherToClipboard() {
        await navigator.clipboard.writeText(voucher);
        alert('Copied!');
    }
</script>

<div class="container">
    <label for="voucher">Your voucher for this study:</label>

    <div class="bar">
        <input id="voucher" type="text" value={voucher} readonly />
        <button on:click={copyVoucherToClipboard}>Click to copy</button>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-flow: column nowrap;
        width: clamp(6em, 80%, 100%);
        margin-inline: auto;
        margin-block: 2rem;
    }

    .bar {
        display: flex;
        flex-flow: row nowrap;
        gap: 1rem;
        align-items: baseline;
    }

    label {
        font-weight: bold;
    }

    input {
        flex: 1;
    }

    input,
    button {
        font-size: larger;
        padding: 6px 12px;
    }
</style>
