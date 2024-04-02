rustc-error.json: main.rs
	rustc --error-format=json --json diagnostic-rendered-ansi $< 2>&1 | sponge $@

gpt4-response.json: main.rs
	../+common/prompt-gpt4.py $< $@

gpt4-response.md: gpt4-response.json
	jq -r '.choices[0].message.content' $< | sponge $@

rustc-error.ansi.txt: rustc-error.json
	jq -r .rendered $< > $@
