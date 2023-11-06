<script lang="ts">
    export let questionId: string;

    function id(num: number) {
        return `${questionId}-${num}`;
    }
</script>

<fieldset>
    <legend><slot /></legend>

    <table>
        <thead>
            <tr>
                <th><label for={id(1)}>Complete Beginner</label></th>
                <th><label for={id(2)} /></th>
                <th><label for={id(3)} /></th>
                <th><label for={id(4)}>Intermediate</label></th>
                <th><label for={id(5)} /></th>
                <th><label for={id(6)} /></th>
                <th><label for={id(7)}>Expert</label></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><input id={id(1)} type="radio" name={questionId} value="1" /></td>
                <td><input id={id(2)} type="radio" name={questionId} value="2" /></td>
                <td><input id={id(3)} type="radio" name={questionId} value="3" /></td>
                <td><input id={id(4)} type="radio" name={questionId} value="4" /></td>
                <td><input id={id(5)} type="radio" name={questionId} value="5" /></td>
                <td><input id={id(6)} type="radio" name={questionId} value="6" /></td>
                <td><input id={id(7)} type="radio" name={questionId} value="7" /></td>
            </tr>
        </tbody>
    </table>
</fieldset>

<style>
    th {
        width: calc(100% / 7);
        font-size: small;
        vertical-align: bottom;
    }
    th,
    td {
        text-align: center;
        border: 0;
        padding-inline: 0;
    }
    label {
        display: inline-block;
        width: 100%;
    }
    input {
        cursor: pointer;
        width: 100%;
    }
</style>
