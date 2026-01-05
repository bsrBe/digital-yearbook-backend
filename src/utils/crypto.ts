import crypto from 'crypto';

/**
 * Encrypts chat message content using AES-256-CBC
 * Results are stored as IV:EncryptedText
 */

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Derive a 32-byte key from the environment secret
const getEncryptionKey = () => {
    const secret = process.env.CHAT_ENCRYPTION_KEY || 'default_yearbook_secret_key_12345';
    return crypto.createHash('sha256').update(secret).digest();
};

export const encrypt = (text: string): string => {
    if (!text) return text;
    
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Return format: iv:encryptedData
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption failed:', error);
        return text;
    }
};

export const decrypt = (encryptedText: string): string => {
    if (!encryptedText || !encryptedText.includes(':')) {
        return encryptedText; // Probably old plaintext message
    }

    try {
        const [ivHex, encryptedData] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        // If decryption fails, it might be an unencrypted legacy message
        return encryptedText;
    }
};
