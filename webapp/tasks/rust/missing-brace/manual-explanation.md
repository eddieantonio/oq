**Error**: mistake detected at end of line 1

```rust
3 | fn main()
  |           ^ mistake detected here
```

**Help**: adding `{` will close the brace on line 9.

```rust
3 | fn main() {
  |           + add open brace here...
...
9 | }
  | ^ ...to match close brace here
```
