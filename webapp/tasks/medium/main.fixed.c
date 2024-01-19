#include <stdio.h>

#define pi 3.141592653589793

float area(float radius) {
    return pi * radius * radius;
}

int main() {
    printf("The area of the circle is: %.1f\n", area(1.128375));
    return 0;
}
