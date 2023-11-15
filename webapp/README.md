# oq webapp

This is the oq web application, built with SvelteKit. See the README in the root
of this repository to understand my setup for developing this application.

# Development

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
