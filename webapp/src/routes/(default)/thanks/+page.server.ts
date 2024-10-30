/**
 * Loads the voucher from query params.
 *
 * Note that the participant ID and their data might be deleted at this point.
 */
export async function load({ url }) {
    const voucher = url.searchParams.get('v');
    return {
        voucher
    };
}
