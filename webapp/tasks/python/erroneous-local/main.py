def complement():
    temp = dna.replace("A", "t")
    temp = temp.replace("C", "g")
    temp = temp.replace("T", "a")
    temp = temp.replace("G", "c")
    temp = temp.upper()

    dna = temp
    return dna


dna = "ACTGATCGATTACGTATAGTATTTGCTATCATACATATATATCGATGCGTTCAT"

print(dna)
print(complement())
