python-errors.txt: main.py
	python3.12 $< 2>&1 | python3 ./filename-filter.py | sponge $@
