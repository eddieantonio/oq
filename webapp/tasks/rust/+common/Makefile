rustc-error.json: main.rs
	rustc --error-format=json --json diagnostic-rendered-ansi $< 2>&1 | sponge $@

rustc-error.ansi.txt: rustc-error.json
	jq -r .rendered $< > $@
