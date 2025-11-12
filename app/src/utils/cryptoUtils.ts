import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const key = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');  // Clave de 64 caracteres hexadecimales (32 bytes)
const iv = Buffer.from('abcdef9876543210abcdef9876543210', 'hex');
// const key = Buffer.from(process.env.ENCRYPT_KEY!, 'hex');
// const iv = Buffer.from(process.env.ENCRYPT_IV!, 'hex');

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

// const key = Buffer.from('1234567890123456789012345678901', 'hex');  // Clave de 64 caracteres hexadecimales (32 bytes)
// const iv = crypto.randomBytes(16);

//const algorithm = 'aes-256-cbc';
// const key = Buffer.from(process.env.ENCRYPT_KEY!, 'hex');
// const iv = Buffer.from(process.env.ENCRYPT_IV!, 'hex');

// export function encrypt(text: string): string {
//     const cipher = crypto.createCipheriv(algorithm, key, iv);
//     let encrypted = cipher.update(text, 'utf8', 'hex');
//     encrypted += cipher.final('hex');
//     return encrypted;
// }

// export function decrypt(encryptedText: string): string {
//     const decipher = crypto.createDecipheriv(algorithm, key, iv);
//     let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');
//     return decrypted;
// }