# Requires
#  - jq -- https://jqlang.github.io/jq/
#  - moreutils -- https://joeyh.name/code/moreutils/
python-errors.txt: main.py
	python3.12 $< 2>&1 | ../+common/python-traceback-filter | sponge $@

gpt4-response.json: main.py
	../+common/prompt-gpt4.py $< $@

gpt4-response.md: gpt4-response.json
	jq -r '.choices[0].message.content' $< | sponge $@
