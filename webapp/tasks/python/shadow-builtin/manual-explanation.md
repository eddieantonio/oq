**Error**: cannot use `str` like a function, because `str` objects are not callable

```python
   5 | print(str(number) + " is my favourite number")
     |       ~~~~~~~~~~~ `str` is not callable
```

**Note**: `str` is NOT the builtin `str` because it has been shadowed by this assignment:

```python
   1 | str = "hello, world"
     | ^^^ ^ str assigned here (shadows builtin str)
```

**Help**: If you intend to use the builtin `str`, consider renaming this
variable to something else:

```python
   1 | str = "hello, world"
     | ^^^ rename this variable
```
