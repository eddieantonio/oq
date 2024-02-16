**Error**: cannot assign to `a + b`

```rust
6 |     a + b = c;
  |     ~~~~~ cannot assign to this expression
```

**Help**: swap either side of the assignment if you want `c` to be
assigned to the value of `a + b`.

```rust
6 |     c = a + b;
  |     ^   ^^^^^ swap these two sides
```
