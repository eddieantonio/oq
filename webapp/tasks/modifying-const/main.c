#include <iostream>

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
    std::cout << "the 7th fibonacci number is " << fibonacci(7) << std::endl;
    return 0;
}
