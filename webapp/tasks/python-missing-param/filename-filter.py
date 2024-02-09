#!/usr/bin/env python3

import fileinput
import re
from pathlib import PurePosixPath

# Not a fool-proof regular expression, but it will work:
pattern = re.compile(r'  File "([^"]+)"')


def simplify_path(matchobj):
    path = PurePosixPath(matchobj.group(1))
    return f'  File "{path.name}"'


for line in fileinput.input():
    print(pattern.sub(simplify_path, line), end="")
