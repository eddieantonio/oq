#include <stdio.h>

int fibonacci(const int n) {
    int now = 0, next = 1;
    int temp;
    while (n > 0){
        temp = now + next;
        now = next;
        next = temp;
        n = n - 1;
    }
    return now;
}

int main() {
    printf("the 7th fibonacci number is %d\n", fibonacci(7));
    return 0;
}
