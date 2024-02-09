def fibonacci(n):
    sequence = tuple()
    now = 0
    next = 1
    for i in range(n):
        temp = now + next
        now = next
        next = temp
        sequence.append(now)
    return sequence


print("the first 7 fibonacci numbers are", fibonacci(7))
