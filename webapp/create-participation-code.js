import * as crypto from 'crypto';
import * as assert from 'assert';

const SALT_LENGTH = 16;
const HASH_LENGTH = 32;
const SCRYPT_COST_EXP = 14;
const SCRYPT_COST = 2 ** SCRYPT_COST_EXP;

const salt = Buffer.alloc(SALT_LENGTH);
crypto.randomFillSync(salt);

// get password from argv lololololol. Copilot does not even want to do it the right way.
const password =
    process.argv[2] ||
    (() => {
        throw new Error('No password provided');
    })();
const hash = crypto.scryptSync(password, salt, HASH_LENGTH, {
    cost: SCRYPT_COST
});

const storage = `$scrypt$${SCRYPT_COST_EXP}$${salt.toString('base64')}$${hash.toString('base64')}`;
console.log(storage);

const [, _scrypt, rounds_base10, salt_base64, hash_base64] = storage.split('$');

assert.strictEqual(_scrypt, 'scrypt');
const rounds = parseInt(rounds_base10, 10);
assert.strictEqual(rounds, SCRYPT_COST_EXP);
assert.strictEqual(0, Buffer.from(salt_base64, 'base64').compare(salt));
const newHash = crypto.scryptSync(password, salt, HASH_LENGTH, {
    const: 2 ** rounds
});
assert.strictEqual(0, Buffer.from(hash_base64, 'base64').compare(newHash));
console.log('OK');
