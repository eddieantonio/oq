**Error**: mistake at end of line 3

```
   3 | int main(int argc, char* argv[]) 
     |                                 ^ problem detected here
```

**Help**: adding `{` will close the bracket on line 13.

```
   3 | int main(int argc, char* argv[]) {
     |                                  + add open bracket here
  ...
  13 | }
     | - to match close bracket here
```
