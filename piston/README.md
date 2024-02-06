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

### Install packages

Make sure you have the [Piston CLI][] cloned somewhere on your computer.
Use their instructions to set it up.

Now, use the Piston CLI to install desired base packages.

    node cli ppman install gcc=10.2.0
    node cli ppman install python=3.12.0
    node cli ppman install rust=1.68.2

Note, this will copy files to a bind mount (should be
`./data/piston/packages`).

Now you're ready to build and tag the `packages-only` image!
First, I get the metadata, just so I know what packages were installed:

```sh
curl -f http://localhost:2000/api/v2/runtimes -o piston-runtimes.json
```

Then I build and tag the `packages-only` image as such:

```sh
docker build . --target packages-only --tag ghcr.io/eddieantonio/piston:20231101-packages-only \
    --label "piston-packages=$(cat ./piston-runtimes.json)"
```

For the tag name, I'm using the date of that the Piston image was
packaged, plus my own custom tags.

> [!NOTE]
> The Docker build context will be several GiBs. This is normal, albeit,
> unfortunate. Just be patient!
>
>     => [internal] load build context     25.1s
>     => => transferring context: 3.55GB   24.8s

> [!NOTE]
> The `Dockerfile` is a [multi-stage build][]. I am only using
> one stage at a time.

Now push just this tag to the package repository:

```sh
docker push ghcr.io/eddieantonio/piston:20231101-packages-only
```

Pushing this image will take a long time, because the Piston package has
a lot of extra crap :/

You may now bring down the original Piston container, as it is no longer
needed:

    docker compose down

### Add customizations

The customizations (e.g., build flags) are in `patches/`. The
`Dockerfile` overwrites the files in the Piston directory with these
patches. Go edit the files (e.g., `compile` and `run`), then come back
here!

With the customizations in place, build and push image, this time using
the `with-customizations` tag:

```sh
docker build . --target with-customizations --tag ghcr.io/eddieantonio/piston:20231101-with-customizations \
docker push ghcr.io/eddieantonio/piston:20231101-with-customizations
```

> [!IMPORTANT]
> You must rebuild and push the image whenever you make any sort of
> customization to the patch files. So if you want to change the build
> flags? Rebuild. Wanna change the environment variables in Python?
> Rebuild. Wanna force ANSI colors during Rust compilation? Believe it
> or not, rebuild.


## Using Piston in oq

Finally, you can run Piston using this custom image! The
`docker-compose.yml` in the root of the repository should use the tagged
versions above.  Note: do not mount a volume for `/piston/packages`! The
`docker-compose.yml` in the root of the repository should be setup
correctly.

### Testing customizations

Go to the root of the repository, and spin up _only_ the Piston
service:

    docker compose up piston

Now you can use the Piston CLI to try running some code:

    # In the cloned engineerman/piston repository:
    node cli execute c main.c


## Improvements

The image with the packages installed are CHONKY! A possible improvement
would be to remove `pkg.tar.gz` from each Piston package. You can also
delete all documentation from each package before copying it over into
the Docker image.

[multi-stage build]: https://docs.docker.com/build/building/multi-stage/
[Piston]: https://github.com/engineer-man/piston
[Piston CLI]: https://github.com/engineer-man/piston?tab=readme-ov-file#after-system-dependencies-are-installed-clone-this-repository
