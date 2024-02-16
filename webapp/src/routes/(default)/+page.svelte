<script lang="ts">
    import ActionBar from '$lib/components/forms/ActionBar.svelte';

    let classroom: string | undefined;
    $: disableButton = !classroom;
</script>

<div class="wrapper">
    <form method="POST">
        <div class="stacked">
            <label for="class">Please choose your class/module:</label>
            <select id="class" name="classroom" bind:value={classroom} required>
                <option value="aalto-rust">FITech 101 Rust</option>
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

        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }

    form {
        max-width: 70ch;
    }

    .stacked {
        display: flex;
        flex-flow: column;
    }
</style>
