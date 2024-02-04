#include <iostream>

#const pi 3.141592653589793

float area(float radius) {
    return pi * radius * radius;
}

int main() {
    std::cout << "The area of the circle is: " << area(1.128375) << std::endl;
    return 0;
}
