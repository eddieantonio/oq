<script lang="ts">
    import { shuffled } from '$lib/random';
    import { marked } from 'marked';
    import FormGroup from './FormGroup.svelte';

    export let questions: { questionId: string; label: string }[];
    export let scale: string[] = [
        'Strongly disagree',
        'Somewhat disagree',
        'Neutral',
        'Somewhat agree',
        'Strongly agree'
    ];

    export let randomized: boolean = false;
    let effectiveQuestions = randomized ? shuffled(questions) : questions;
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
            {#each effectiveQuestions as { questionId, label }}
                <tr>
                    <th scope="row" class="question-label">{@html marked(label)}</th>
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

    .question-label {
        font-weight: normal;
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
