#include <iostream>

float convert() {
    return (fahrenheit - 32.0) / 1.8;
}

int main() {
    std::cout << "68 fahrenheit is " convert(68.0) << " celsius" << std::endl;
    return 0;
}
