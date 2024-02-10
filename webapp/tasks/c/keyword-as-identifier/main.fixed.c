#include <stdio.h>

int main(int argc, char* argv[]){

   int nonUnion = 421;
   int union_ = 324;
   float ratio;

   ratio = (float)union_ / (float)nonUnion;

   printf("The percentage of union workers is %f.\n", 100 * ratio);

   return 0;
}
