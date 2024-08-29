**Error**: `#const` is not a valid preprocessor directive.

```
   3 | #const pi 3.141592653589793
     | ~~~~~~ invalid
```

**Help**: If you are trying to define a preprocessor constant, use `#define` instead:

```
   3 | #define pi 3.141592653589793
     | ^^^^^^^ change here
```
