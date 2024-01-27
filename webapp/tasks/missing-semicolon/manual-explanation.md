**Error**: mistake detected at end of line 3

```
   3 | int main(int argc, char* argv[])
     |                                 ^ mistake detected here
```

**Help**: adding `{` will close the brace on line 13.

```
   3 | int main(int argc, char* argv[]) {
     |                                  + add open brace here...
  ...
  13 | }
     | - ...to match close brace here
```
