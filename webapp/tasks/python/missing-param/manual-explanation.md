**Error**: calling `convert()` with 1 argument when it takes
0 arguments.

```
   4 | print(68.0, "fahrenheit is", convert(68.0), "celsius")
     |                              ~~~~~~~~~~~~~ argument mismatch
```

**Note**: `convert()` is defined on line 1:

```
   1 | def convert():
     |            ^^ takes 0 arguments
```

**Help**: If the **definition on line 1 is correct**, then **adjust the
call on line 4** to remove the unnecessary argument.

```
   4 | print(68.0, "fahrenheit is", convert( ), "celsius")
     |                                      - remove this argument
```

**Help**: If the **usage on line 4 is correct**, then **adjust the definition
on line 1** to declare an extra parameter.

```
   1 | def convert(   ):
     |             +++ insert a parameter name here
```
