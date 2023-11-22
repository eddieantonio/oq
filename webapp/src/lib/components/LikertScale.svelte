<script lang="ts">
    export let questionId: string;
    export let labels: string[] = [
        'Strongly disagree',
        '',
        '',
        'Neutral',
        '',
        '',
        'Strongly agree'
    ];

    function id(num: number) {
        return `${questionId}-${num}`;
    }
</script>

<fieldset>
    <legend><slot /></legend>

    <table>
        <thead>
            <tr>
                {#each labels as label, index}
                    <th><label for={id(index + 1)}>{label}</label></th>
                {/each}
            </tr>
        </thead>
        <tbody>
            <tr>
                {#each labels as _label, index}
                    {@const num = index + 1}
                    <td><input id={id(num)} type="radio" name={questionId} value={num} /></td>
                {/each}
            </tr>
        </tbody>
    </table>
</fieldset>

<style>
    th {
        width: calc(100% / 7);
        font-size: small;
        vertical-align: middle;
    }

    th,
    td {
        text-align: center;
        border: 0;
        padding-inline: 0;
    }

    label {
        display: inline-block;
    }

    label,
    input {
        width: 100%;
        cursor: pointer;
    }

    td:hover {
        background-color: var(--nc-bg-3);
    }
</style>
