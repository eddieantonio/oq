**Error**: trying to reassign (modify) `n`, but `n` is declared `const`.
Variables declared `const` (constant) cannot be reassigned.

```
   8 |         n = n - 1;
               ~~~~~~~~~ not allowed: n is const
```

**Note**: `n` is declared `const` on line 2:

```
   1 | int fibonacci(const int n) {
                     ^^^^^ declared const here
```

**Help** Option 1: Remove `const` from n

```
 ! 1 | int fibonacci(const int n) {
                     ----- remove this
```

**Help**: Option 2: Introduce a new, non-`const` variable

 1. Create a new variable and initialize it with the value of `n`:

```
 + 2 |     int i = n;
           +++++++++ new variable
```

 2. Change all instance of `n` to this new variable:

```
 ! 5 |     while (i > 0){
                  ^ change here
   ...

 ! 9 |         i = i - 1;
               ^   ^ change here
```
