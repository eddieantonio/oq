<script lang="ts">
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
        <div class="action-bar">
            <button type="submit" disabled={disableButton}>Continue</button>
        </div>
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

    .action-bar {
        display: flex;
        justify-content: flex-end;
    }
</style>
