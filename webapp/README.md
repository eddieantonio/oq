# oq webapp

This is the oq web application, built with SvelteKit. See the README in the root
of this repository to understand my setup for developing this application.

# Development

## Database migrations and seed files

You need to run database migrations for the database to: 1) exist; 2)
have the correct data.

The way you do this is **in development** is:

> [!IMPORTANT]
> You will need to run `knex --knexfile /app/knexfile.cjs` instead of
> using these!

```bash
npm run migrate
```

You also need to insert seed data (namely, the classroom).
To do this, run the following:

```
npm run seed
```

It will prompt you for participation code for the test classroom. This
is sort of like a password for accessing the rest of the app's features.

## Building

(this section is from the svelte-kit template repo)

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
