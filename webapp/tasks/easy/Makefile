# Requires
#  - jq -- https://jqlang.github.io/jq/
#  - moreutils -- https://joeyh.name/code/moreutils/
gcc-errors.json: main.c
	gcc-13 -fdiagnostics-format=json 2>&1 $< | jq | sponge $@
