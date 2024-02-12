python-errors.txt: main.py
	python3.12 $< 2>&1 | ../+common/python-traceback-filter | sponge $@

gpt4-response.json: main.py
	../+common/prompt-gpt4.py $< $@
