#!/bin/sh

set -e

main() {
    main_markdown | pandoc -t latex --listings
}

main_markdown() {
    markdown_for flipped-assignment 'Flipped assignment'
    markdown_for invalid-define 'const instead of define'
    markdown_for keyword-as-identifier 'Keyword as identifier'
    markdown_for missing-param 'Missing parameter'
    markdown_for missing-brace 'Missing curly brace'
    markdown_for modifying-const 'Reassigning a constant'
}

markdown_for() {
    task="$1"
    name="$2"

    echo "# $name"
    echo

    (cd "$task" && create_internal_markdown)
    echo
}

create_internal_markdown() {
    echo '```c'
    cat main.c
    echo '```'
    echo

    echo '## Error message'
    echo
    echo '```'
    gcc-14 2>&1 main.c || true
    echo '```'
    echo

    echo '## Handwritten explanation'
    cat manual-explanation.md
    echo

    echo '## GPT-4 explanation'
    cat gpt4-response.md
    echo
}

main
