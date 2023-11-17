/**
 * Loads the consent form. To get here, the classroom must be in the route URL.
 * That is, the URL looks something like this:
 *
 * /consent/my-classroom
 *
 * We pass this on to the HTML, since it's needed for the form submission.
 */
export function load({ params }) {
    return {
        classroom: params.classroom
    };
}
