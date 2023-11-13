<script lang="ts">
    export let name: string;
    export let value: boolean;
</script>

<label>
    <div class="box">
        <input type="checkbox" {name} bind:checked={value} />
    </div>
    <div class="text">
        <slot />
    </div>
</label>

<style>
    label {
        display: flex;
        flex-flow: row nowrap;
        gap: 1rem;

        cursor: pointer;

        margin-block-end: 0.5lh;
    }

    .box {
        flex: 0 0 auto;
        display: grid;
        place-items: center;
    }

    .text {
        flex: 1 1 auto;
    }

    label:hover {
        background-color: var(--nc-bg-3);
    }
</style>
