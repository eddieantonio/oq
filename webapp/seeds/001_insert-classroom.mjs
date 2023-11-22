/**
 * Interactively asks for a participation code and inserts it into the database.
 */

// @ts-expect-error - password prompt is not typed
import prompt from 'password-prompt';
import * as crypto from 'crypto';

const TEST_CLASSROOM_ID = 'TEST-CLASS';

const SALT_LENGTH = 16;
const HASH_LENGTH = 32;
const SCRYPT_COST_EXP = 14;
const SCRYPT_COST = 2 ** SCRYPT_COST_EXP;

/**
 * @param {import('knex')} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    // Ask for the participation code:
    const password = await prompt(`Participation code for ${TEST_CLASSROOM_ID}: `, {
        method: 'hide'
    });

    await knex('classrooms').insert([
        { classroom_id: TEST_CLASSROOM_ID, hashed_participation_code: hash(password) }
    ]);
}

/**
 * @param {string} password
 * @returns {string} hash
 */
function hash(password) {
    const salt = Buffer.alloc(SALT_LENGTH);
    crypto.randomFillSync(salt);

    const hash = crypto.scryptSync(password, salt, HASH_LENGTH, { cost: SCRYPT_COST });
    return `$scrypt$${SCRYPT_COST_EXP}$${salt.toString('base64')}$${hash.toString('base64')}`;
}