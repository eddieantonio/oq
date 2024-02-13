**Error**: `tuple` does not have a method called `.append()`.

```python
   9 |         sequence.append(now)
     |                  ~~~~~~ method not found for tuple
```

**Note**: `sequence` is a `tuple` created on line 2:

```python
   2 |     sequence = tuple()
     |                ----- created here
```

**Help**: `.append()` exists on `list` objects. If you want to append an
element to the end of a sequence, consider using a `list` instead.

```python
   2 |     sequence = list()
     |                ^^^^ consider using a list here
```
