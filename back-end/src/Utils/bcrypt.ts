import { randomBytes, createHash } from 'crypto';

const DEFAULT_RANDOM_LENGTH:number = 16
const HASH_TYPE: string = 'sha256'
const DIGIT: string = 'hex'

const generateRandomSalt = (length: number = DEFAULT_RANDOM_LENGTH): string => {
    return randomBytes(length).toString('hex');
};

const hashPassword = (password: string, salt: string): string => {
    const hash = createHash(HASH_TYPE);
    hash.update(password + salt);
    return hash.digest('hex');
};

const comparePassword = (password: string, salt: string, hashedPassword: string): boolean => {
    const hashedAttempt = hashPassword(password, salt);
    return hashedAttempt === hashedPassword;
};


const generateVerificationPin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();  
}

const passwordGenerate = (password : string) => {
    let saltInit = generateRandomSalt()
    const passwordAfterModify = {
            salt : saltInit,
            hash : hashPassword(password, saltInit),
            verificationPin: generateVerificationPin(),
            pinExpiry: new Date(Date.now() + 1000 * 60 * 10) // Hạn 10 phút 
        }
    return passwordAfterModify

}

export default {
    passwordGenerate,
    comparePassword
}