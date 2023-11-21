import * as crypto from 'crypto';
import * as assert from 'assert';

/**
 * Newtype for a password hash, as stored in the database.
 */
export type PasswordHash = string & { __passwordHash: never };

/**
 * Returns true if the participation code is correct.
 *
 * @param stored The hash from the database.
 * @param entry The participantion code that you want to check.
 */
export function validateParticipationCode(stored: PasswordHash, entry: string): boolean {
    // I'm expecting the participation code to be stored in the database in this format:
    // $scrypt$costExpBase10$saltBase64$hashBase64
    const [, _scrypt, costExpBase10, saltBase64, hashBase64] = stored.split('$');
    assert.strictEqual(_scrypt, 'scrypt');

    const cost = 2 ** parseInt(costExpBase10, 10);
    const salt = Buffer.from(saltBase64, 'base64');
    const hash = Buffer.from(hashBase64, 'base64');

    // TODO: this should be async
    const newHash = crypto.scryptSync(entry, salt, hash.length, { cost });

    return crypto.timingSafeEqual(hash, newHash);
}
