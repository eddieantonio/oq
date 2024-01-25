<script lang="ts">
    import FormGroup from './FormGroup.svelte';

    export let questionId: string;
    export let labels: string[] = [
        'Strongly disagree',
        'Slighly disagree',
        'Neutral',
        'Slighly agree',
        'Strongly agree'
    ];

    function id(num: number) {
        return `${questionId}-${num}`;
    }
</script>

<FormGroup>
    <p class="label"><slot /><span class="required">*</span></p>
    <table>
        <thead>
            <tr>
                {#each labels as label, index}
                    <th scope="col"><label for={id(index + 1)}>{label}</label></th>
                {/each}
            </tr>
        </thead>
        <tbody>
            <tr>
                {#each labels as _label, index}
                    {@const num = index + 1}
                    <td>
                        <label class="clickable-area">
                            <input
                                id={id(num)}
                                type="radio"
                                name={questionId}
                                required
                                value={num}
                            />
                        </label></td
                    >
                {/each}
            </tr>
        </tbody>
    </table>
</FormGroup>

<style>
    th {
        width: calc(100% / 5);
        font-size: smaller;
        vertical-align: middle;
    }

    th,
    td {
        text-align: center;
        border: 0;
        padding-inline: 0;
    }

    th > label {
        display: inline-block;
        cursor: pointer;
    }

    .clickable-area {
        display: block;
        height: 100%;
        width: 100%;
        cursor: pointer;
    }
    .clickable-area:hover {
        background-color: var(--nc-bg-3);
    }

    td {
        padding-block: 0;
        min-height: 2rem;
    }
</style>
