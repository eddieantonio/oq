#include <stdio.h>

int fibonacci(const int n) {
    int i = n;
    int now = 0, next = 1;
    int temp;
    while (i > 0){
        temp = now + next;
        now = next;
        next = temp;
        i = i - 1;
    }
    return now;
}

int main() {
    printf("the 7th fibonacci number is %d\n", fibonacci(7));
    return 0;
}
