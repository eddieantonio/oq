<script lang="ts">
    import Ide from '$lib/components/IDE.svelte';

    export let data: import('./$types').PageData;

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

<Ide enabled={!!data.participantId} {language} {content} {condition} />
