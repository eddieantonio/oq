/**
 * Get the voucher from cookies if it exists.
 */
export function load({ cookies }) {
    return {
        voucher: cookies.get('voucher')
    };
}
