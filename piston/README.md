# Piston

This customizes the [Piston][] code execution engine for use with oq.

Unfortunately, [Piston][] does not have a (working!) declarative format for
specifying:
 - which packages to install by default
 - what compiler flags should be used

So it requires some **manual** customization.

> [!TIP]
> You could say that I'm too lazy to write a script to automate it. You
> could be correct in saying that.

## How to create a custom Piston image

First, spin up a Piston container. Use the `docker-compose.yml` provided
here to use the appropriate settings:

    docker compose up -d

Make sure you have the [Piston CLI][] installed somewhere on your computer.
Use their instructions to set it up.

Now, use the Piston CLI to install desired base packages.

    cli/index.js ppman install gcc 10.2.0

Note, this will copy files to a bind mount (should be `./data/piston/packages`)

Now you can modify `./data/piston/packages/gcc/10.2.0/compile` to have
correct compile flags (e.g., `-fdiagnostics-format=json`). This is how
I configured it:

```sh
#!/usr/bin/env bash

set -e
# Put instructions to compile source code, remove this file if the language does not require this stage


case "${PISTON_LANGUAGE}" in
    c)
        rename 's/$/\.c/' "$@" # Add .c extension
        gcc -std=c11 -fdiagnostics-format=json *.c -lm
        ;;
    c++)
        rename 's/$/\.cpp/' "$@" # Add .cpp extension
        g++ -std=c++17 -fdiagnostics-format=json *.cpp
        ;;
    d)
        rename 's/.code$/\.d/' "$@" # Add .d extension
        gdc *.d
        ;;
    fortran)
        rename 's/.code$/\.f90/' "$@" # Add .f90 extension
        gfortran *.f90
        ;;
    *)
        echo "How did you get here? (${PISTON_LANGUAGE})"
        exit 1
        ;;
esac

chmod +x a.out
```

Make sure that this configuration works before continuing!

You may now bring down the original Piston container:

    docker compose down

With all this in place, you can build a customized Piston image with the
supplied Dockerfile! The Dockerfile should look something like this:

```dockerfile
FROM ghcr.io/engineer-man/piston:latest
COPY ./data/piston/packages /piston/packages
```

Now you can build and tag the image:

    docker build --tag ghcr.io/eddieantonio/piston:20231101-gcc10 .

For the tag name, I am using the tag of the base image and appending the
packages that I installed to it.

> [!NOTE]
> The Docker build context will be several GiBs. This is normal, albeit,
> unfortunate. Just be patient!

Finally, you can run Piston using this custom image! Note: do not mount a volume for /piston/packages!
This should be configured in the root directory of this repository!

[Piston]: https://github.com/engineer-man/piston
[Piston CLI]: https://github.com/engineer-man/piston?tab=readme-ov-file#after-system-dependencies-are-installed-clone-this-repository
