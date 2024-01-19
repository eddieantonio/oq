#include <stdio.h>

float convert(float fahrenheit) {
    return (fahrenheit - 32.0) / 1.8;
}

int main() {
    printf("%.1f fahrenheit is %.1f celsius\n", 68.0, convert(68.0));
    return 0;
}
