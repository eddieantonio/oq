<script lang="ts">
    import Ide from '$lib/components/IDE.svelte';
    import type { ExerciseId } from '$lib/server/newtypes';

    export let data: import('./$types').PageData;

    let exercise = 'test-exercise' as ExerciseId;
    let condition: import('$lib/types').Condition = 'llm-enhanced';
    let language = 'c';
    /* A C program with an error in it! */
    let content = [
        'include <stdio.h>',
        '',
        'int main() {',
        '   printf("Hello, World!\\n");',
        '   return 0;',
        '}'
    ].join('\n');
</script>

<Ide enabled={!!data.participantId} {language} {content} {condition} {exercise} />
