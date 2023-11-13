# Remote code execution

"RCE" stands for "Remote code execution". I need to run the students'
code in a sandboxed environment. For the time being, I do **not** have
a sandboxed environment. Here are some that I think I should check out:

 - https://github.com/trampgeek/jobe
 - https://github.com/engineer-man/piston

There are probably many, many more.

Anyway, this serves as a VERY basic remote code execution engine for the
time being. 

**This application must NOT be used in production!**

## Trying out the app

Once the app is started by running `docker compose up --build` in the parent directory, this application can be smoketested by running:

    http -f POST :8000/run/gcc file@main.c

`http` is [httpie](https://httpie.io/docs/cli)