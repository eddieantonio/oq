**Error**: `let` is not allowed at the top-level.

```rust
1 | let PI = 3.141592653589793;
  | ~~~ not allowed here
```

**Help**: Consider using `const` to define a constant at the top-level:

```rust
1 | const PI: f64 = 3.141592653589793;
  | +++++   +++++ add an appropriate type here
  |     | consider using const instead
```
