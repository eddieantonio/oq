**Error**: trying to reassign (modify) `n`, but `n` is not declared `mut`.
By default, parameters cannot be reassigned.

```rust
8 |         n = n - 1;
  |         ~~~~~~~~~ not allowed: n is not mut
```

**Note**: `n` is declared on line 1:

```rust
1 | fn fibonacci(n: u64) -> u64 {
  |              ------ n is declared here
```

**Help**: Option 1: Consider declaring `n` as `mut`:

```rust
1 | fn fibonacci(mut n: u64) -> u64 {
  |              +++ add mut here
```

**Help**: Option 2: Consider introducing a new `mut` variable:

 1. Create a new `mut` variable and initialize it with the value of `n`:

```rust
4 |     let mut i = n;
  |     ++++++++++++++ new mutable variable
```

 2. Change all instance of `n` to this new variable:

```rust
5 |     while (i > 0){
  |            + change here
...
  |
9 |         i = i - 1;
  |         +   + change here
```
