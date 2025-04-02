#!/bin/sh

set -e

main() {
    main_markdown | pandoc -t latex --listings
}

main_markdown() {
    markdown_for keyword-as-identifier 'Keyword as identifier'
    markdown_for misspelled-keyword "Misspelled \'elif\`"
    markdown_for missing-indent 'Missing indentation'
    markdown_for missing-param 'Missing parameter'
    markdown_for shadow-builtin 'Redefined built-in'
    markdown_for erroneous-local 'Erroneous local'
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
    echo '```python'
    cat main.py
    echo '```'
    echo

    echo '## Error message'
    echo
    echo '```'
    cat python-errors.txt
    echo '```'
    echo

    echo '## GPT-4 explanation'
    cat gpt4-response.md
    echo

    echo '## Fine-tuned explanation'
    cat ft-response.md
}

main
