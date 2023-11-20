/**
 * The information sheet needs to know the classroom to be able to advance to
 * the consent form WITHOUT storing a cookie. So this information is passed in
 * as a route parameter.
 */
export function load({ params }) {
    return {
        classroom: params.classroom
    };
}
