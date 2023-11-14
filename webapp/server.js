/**
 * A custom server for SvelteKit. My only motivation for this is the fact that
 * the default server does not log requests.
 *
 * See: https://kit.svelte.dev/docs/adapter-node#custom-server
 */
import connect from 'connect';
import morgan from 'morgan';

import { handler } from './build/handler.js';

const app = connect();

// Log requests. Somehow this is not default functionality in nodeland.
app.use(morgan('common'));
// Delegate to SvelteKit for... pretty much everything.
app.use(handler);

app.listen(3000, () => {
	console.log('listening on port 3000');
});
