<script lang="ts">
    export let questionId: string;
</script>

<fieldset>
    <legend><slot /></legend>

    <div class="scale-degrees">
        <div class="degree">
            <label for={questionId + '-' + 1}>Complete Beginner</label><input
                id={questionId + '-' + 1}
                type="radio"
                name={questionId}
                value="1"
            />
        </div>
        <div class="degree">
            <label for={questionId + '-' + 2} /><input
                id={questionId + '-' + 2}
                type="radio"
                name={questionId}
                value="2"
            />
        </div>
        <div class="degree">
            <label for={questionId + '-' + 3} /><input
                id={questionId + '-' + 3}
                type="radio"
                name={questionId}
                value="3"
            />
        </div>
        <div class="degree">
            <label for={questionId + '-' + 4}>Intermediate</label><input
                id={questionId + '-' + 4}
                type="radio"
                name={questionId}
                value="4"
            />
        </div>
        <div class="degree">
            <label for={questionId + '-' + 5} /><input
                id={questionId + '-' + 5}
                type="radio"
                name={questionId}
                value="5"
            />
        </div>
        <div class="degree">
            <label for={questionId + '-' + 6} /><input
                id={questionId + '-' + 6}
                type="radio"
                name={questionId}
                value="6"
            />
        </div>
        <div class="degree">
            <label for={questionId + '-' + 7}>Expert</label><input
                id={questionId + '-' + 7}
                type="radio"
                name={questionId}
                value="7"
            />
        </div>
    </div>
</fieldset>

<style>
    .scale-degrees {
        display: flex;
        flex-flow: row nowrap;
    }
    .degree {
        display: flex;
        flex-flow: column nowrap;
        flex: 1;
    }
    .degree label {
        flex: 1;
        font-size: smaller;
        text-align: center;
    }
</style>
