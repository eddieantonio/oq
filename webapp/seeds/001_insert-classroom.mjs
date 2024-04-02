/**
 * Interactively asks for a participation code and inserts it into the database.
 */

// @ts-expect-error - password prompt is not typed
import prompt from 'password-prompt';
import * as crypto from 'crypto';

const SALT_LENGTH = 16;
const HASH_LENGTH = 32;
const SCRYPT_COST_EXP = 14;
const SCRYPT_COST = 2 ** SCRYPT_COST_EXP;

/**
 * @param {import('knex')} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    const realClassroom = await promptForPassword('aalto-rust');

    await knex('classrooms').insert([realClassroom]);
}

/**
 * @param {string} classroom
 * @returns {Promise<{ classroom_id: string, hashed_participation_code: string }>}
 */
async function promptForPassword(classroom) {
    // Ask for the participation code:
    const password = await prompt(`Participation code for ${classroom}: `, {
        method: 'hide'
    });

    return { classroom_id: classroom, hashed_participation_code: hash(password) };
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
