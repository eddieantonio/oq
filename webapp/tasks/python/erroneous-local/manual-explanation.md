**Error**: the local variable `dna` is being used before it has been assigned.

```python
   2 | temp = dna.replace("A", "x")
     |        ~~~ variable used before it has been assigned
```

**Note**: the first assignment to `dna` in `complement()` is here:

```python
   8 | dna = temp
     |     ^ assignment occurs here
```

Any assignment to a variable within a function body makes it a local
variable.

**Help**: if you're trying to assign to the global variable called
`dna`, use the `global` keyword to declare it as such:


```python
   1 | def complement():
   2 |     global dna
     |     ++++++++++ insert this line to declare `dna` as a global
```
