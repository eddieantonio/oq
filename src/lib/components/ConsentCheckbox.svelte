<script lang="ts">
    export let name: string;
    export let value: boolean;
</script>

<div class="consent-checkbox">
    <label>
        <input type="checkbox" {name} bind:checked={value} />
        <slot />
    </label>
</div>

<style>
    .consent-checkbox:hover {
        background-color: #eee;
    }
</style>
