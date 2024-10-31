def complement():
    temp = dna.replace("A", "x")
    temp.replace("C", "y")
    temp.replace("T", "A")
    temp.replace("G", "C")
    temp.replace("x", "T")
    temp.replace("y", "G")

    dna = temp
    return dna


dna = "ACTGATCGATTACGTATAGTATTTGCTATCATACATATATATCGATGCGTTCAT"

print(complement())
