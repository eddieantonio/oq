import * as crypto from 'crypto';
import * as assert from 'assert';

/**
 * Newtype for a password hash, as stored in the database.
 */
export type PasswordHash = string & { __passwordHash: never };

export function validateParticipationCode(stored: PasswordHash, entry: string): boolean {
    // I'm expecting the participation code to be stored in the database in this format:
    // $scrypt$cost_exp_base10$salt_base64$hash_base64
    const [, _scrypt, cost_exp_base10, salt_base64, hash_base64] = stored.split('$');
    assert.strictEqual(_scrypt, 'scrypt');

    const cost = 2 ** parseInt(cost_exp_base10, 10);
    const salt = Buffer.from(salt_base64, 'base64');
    const hash = Buffer.from(hash_base64, 'base64');

    const newHash = crypto.scryptSync(entry, salt, hash.length, { cost });

    return crypto.timingSafeEqual(hash, newHash);
}
