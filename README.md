# oq

The **Project Obscure Questionnaire** platform.

# Development

Here is my development setup:

 - Use docker-compose to run the development server
 - Use Visual Studio Code with the Prettier extension to edit files

```sh
docker-compose up --build
```

Note: I do **not** daemonize `docker-compose` (i.e., provide the `-d` option) during development.

This should install all the dependencies WITHIN Docker. This also means if you
add dependencies in `package.json`, **you will need to rebuild the container**
(just restarting the above command should do the trick).

After this, you should have a live-reloading version of the site on <http://localhost:5173/> (that's vite's default port idk).

## Database migrations

You need to run database migrations for the database to: 1) exist; 2) have seed data.

The way you do this is:

```bash
npm run migrate
```

## Building

(this section is from the svelte-kit template repo)

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
