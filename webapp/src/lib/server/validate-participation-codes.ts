import * as crypto from 'crypto';
import * as assert from 'assert';
import type { PasswordHash } from './newtypes';

/**
 * Returns true if the participation code is correct.
 *
 * @param stored The hash from the database.
 * @param partcipation_code The participantion code that you want to check.
 */
export function validateParticipationCode(
    stored: PasswordHash,
    partcipation_code: string
): boolean {
    // I'm expecting the participation code to be stored in the database in this format:
    // $scrypt$costExpBase10$saltBase64$hashBase64
    const [, _scrypt, costExpBase10, saltBase64, hashBase64] = stored.split('$');
    assert.strictEqual(_scrypt, 'scrypt');

    const cost = 2 ** parseInt(costExpBase10, 10);
    const salt = Buffer.from(saltBase64, 'base64');
    const hash = Buffer.from(hashBase64, 'base64');

    // TODO: this should be async
    const newHash = crypto.scryptSync(partcipation_code, salt, hash.length, { cost });

    return crypto.timingSafeEqual(hash, newHash);
}
