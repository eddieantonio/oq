**Error**: there is no variable called `fahrenheit` in scope.

```rust
2 |     return (fahrenheit - 32.0) / 1.8;
  |             ~~~~~~~~~~ no variable called `fahrenheit` in scope
```


**Help**: consider adding a parameter called `fahrenheit`:

```rust
1 | fn convert(fahrenheit: f64) -> f64 {
  |            +++++++++++++++ add parameter here
```
