import { randomBytes, createHash } from 'crypto';

export const generateRandomSalt = (length: number = 16): string => {
    return randomBytes(length).toString('hex');
};

export const hashPassword = (password: string, salt: string): string => {
    const hash = createHash('sha256');
    hash.update(password + salt);
    return hash.digest('hex');
};

export const comparePassword = (password: string, salt: string, hashedPassword: string): boolean => {
    const hashedAttempt = hashPassword(password, salt);
    return hashedAttempt === hashedPassword;
};
