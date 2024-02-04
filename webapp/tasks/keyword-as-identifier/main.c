#include <iostream>

int main(int argc, char* argv[]){

   int nonUnion = 421;
   int union = 324;
   float ratio;

   ratio = (float)union / (float)nonUnion;

   std::cout << "The percentage of union workers is " << 100 * ratio << std::endl;

   return 0;
}
