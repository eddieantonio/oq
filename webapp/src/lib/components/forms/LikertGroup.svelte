<script lang="ts">
    import FormGroup from './FormGroup.svelte';

    export let questions: { questionId: string; label: string }[];
    export let scale: string[] = [
        'Strongly disagree',
        'Somewhat disagree',
        'Neutral',
        'Somewhat agree',
        'Strongly agree'
    ];
</script>

<FormGroup>
    <p class="label"><slot /><span class="required">*</span></p>
    <table>
        <thead>
            <tr>
                <td />
                {#each scale as scaleLabel}
                    <th scope="col" class="scale-label">{scaleLabel}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each questions as { questionId, label }}
                <tr>
                    <th scope="row" class="question-label">{label}</th>
                    {#each scale as _text, index}
                        <td class="checkbox-cell">
                            <label class="checkbox">
                                <input type="radio" name={questionId} required value={index + 1} />
                            </label>
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</FormGroup>

<style>
    .scale-label,
    .question-label {
        font-size: smaller;
    }

    .scale-label {
        text-align: center;
    }

    .checkbox-cell {
        width: calc(100% / 7);
        text-align: center;
    }

    .checkbox {
        display: inline-block;
        width: 100%;
        height: 100%;
        line-height: 2.5;
        cursor: pointer;
    }
    .checkbox > input[type='radio'] {
        cursor: pointer;
    }

    .checkbox:hover {
        background-color: var(--nc-bg-3);
    }
</style>
