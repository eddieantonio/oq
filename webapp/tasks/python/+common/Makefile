# Requires
#  - jq -- https://jqlang.github.io/jq/
#  - moreutils -- https://joeyh.name/code/moreutils/
python-errors.txt: main.py
	python3.12 $< 2>&1 | ../+common/python-traceback-filter | sponge $@

gpt4-response.json: main.py
	../+common/prompt-gpt4o.py $< $@

ft-response.json: main.py
	../+common/prompt-ft.py $< $@

%-response.md: %-response.json
	jq -r '.choices[0].message.content' $< | sponge $@
