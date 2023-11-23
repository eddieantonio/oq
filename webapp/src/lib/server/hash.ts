import crypto from 'node:crypto';
import type { SHA256Hash } from './newtypes';

/**
 * Returns the SHA256 hash of the given source code.
 *
 * The string entire string is encoded to UTF-8, and then the UTF-8 bytes are
 * hashed. The hash is returned as a hexadecimal string, with lowercase letters.
 */
export function hashSourceCode(sourceCode: string): SHA256Hash {
    return crypto.createHash('sha256').update(sourceCode).digest('hex') as SHA256Hash;
}
