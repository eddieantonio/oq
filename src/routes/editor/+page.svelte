<script lang="ts">
    import Editor from '$lib/components/Editor.svelte';

    /* a C hello world program */
    let content = [
        '#include <stdio.h>',
        'int main() {',
        '   printf("Hello, World!");',
        '   return 0;',
        '}'
    ].join('\n');
</script>

<Editor {content} language="c" />
