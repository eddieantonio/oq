# Requires
#  - jq -- https://jqlang.github.io/jq/
#  - moreutils -- https://joeyh.name/code/moreutils/
gcc-diagnostics.json: main.c
	gcc-13 -fdiagnostics-format=json 2>&1 $< | jq | sponge $@

gpt4-response.json: main.c
	../+common/prompt-gpt4.py $< $@

gpt4-response.md: gpt4-response.json
	jq -r '.choices[0].message.content' $< | sponge $@
