**Error**: `ref` is a keyword and cannot be used as variable name.

```rust
3 |    let ref = 324.0;
  |        ~~~ using keyword as a variable name
```

**Help**: either choose a different name for this variable or use a [raw identifier](https://doc.rust-lang.org/reference/identifiers.html#raw-identifiers)
(add `r#` to the beginning of the keyword) if you *must* use `ref` as
the variable name.

```rust
3 |    let r#ref = 324.0;
  |        ++ add r# to use a raw identifier
```
