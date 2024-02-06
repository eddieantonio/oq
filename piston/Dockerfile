# Assumes you have already:
# - pulled Piston
# - installed packages
# - created `piston-runtimes.json`
FROM ghcr.io/eddieantonio/piston:20231101@sha256:6500f2af69ce18fe16ca9a0ba7b0ea895366fc0efa46860c03d1d3c8a6cd270d as packages-only
COPY ./data/piston/packages /piston/packages
# Tag and push the above image for faster customizations in the future

# MAKE SURE THE ABOVE PACKAGE IS UPLOADED TO THE PACKAGE REPOSITORY
# Now, apply necessary customizations:
FROM ghcr.io/eddieantonio/piston:202311011-packages-only@sha256:d67093c35634650deed96685d3537d20cd93e212a60e140fb697505484a1e27f as with-customizations
COPY ./patches/gcc/compile /piston/packages/gcc/10.2.0/compile
