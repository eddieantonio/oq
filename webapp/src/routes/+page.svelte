<script lang="ts">
    import ActionBar from '$lib/components/ActionBar.svelte';

    let classroom: string | undefined;
    $: disableButton = !classroom;
</script>

<div class="wrapper">
    <form method="POST">
        <div class="stacked">
            <label for="class">Please choose your class/module:</label>
            <select id="class" name="classroom" bind:value={classroom} required>
                <option value="TEST-CLASS">Test classroom</option>
            </select>
        </div>

        <ActionBar>
            <button type="submit" disabled={disableButton}>Continue</button>
        </ActionBar>
    </form>
</div>

<style>
    .wrapper {
        display: grid;
        place-items: center;
        min-height: 100vh;
    }

    .stacked {
        display: flex;
        flex-flow: column;
    }
</style>
