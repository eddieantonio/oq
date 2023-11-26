import crypto from 'node:crypto';
import assert from 'node:assert';
import type { PasswordHash } from './newtypes';

/**
 * Resolves to true if the participation code is correct.
 *
 * @param stored The hash from the database.
 * @param partcipation_code The participantion code that you want to check.
 */
export async function validateParticipationCode(
    stored: PasswordHash,
    partcipation_code: string
): Promise<boolean> {
    // I'm expecting the participation code to be stored in the database in this format:
    // $scrypt$costExpBase10$saltBase64$hashBase64
    const [, scrypt, costExpBase10, saltBase64, hashBase64] = stored.split('$');
    assert.strictEqual(scrypt, 'scrypt');

    const cost = 2 ** parseInt(costExpBase10, 10);
    const salt = Buffer.from(saltBase64, 'base64');
    const hash = Buffer.from(hashBase64, 'base64');

    // I tried to use util.promisify, but the optional parameter messes it up.
    const newHash = await new Promise<Buffer>((resolve, reject) => {
        crypto.scrypt(partcipation_code, salt, hash.length, { cost }, (err, hash) => {
            if (err) reject(err);
            else resolve(hash);
        });
    });

    return crypto.timingSafeEqual(hash, newHash);
}
