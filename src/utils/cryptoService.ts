/**
 * Privacy-First Web Crypto API Client
 * Provides AES-GCM 256-bit encryption with PBKDF2 key derivation (100,000 iterations).
 * All encryption and decryption occurs 100% locally on the client hardware.
 */

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Derive AES-GCM 256 key from passphrase and salt using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  v: number;
  salt: string;
  iv: string;
  ciphertext: string;
  timestamp: string;
}

/**
 * Encrypts any string (JSON) using AES-256-GCM with a user master password
 */
export async function encryptData(plainText: string, masterPassword: string): Promise<string> {
  if (!masterPassword) {
    throw new Error('Master password is required for encryption');
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterPassword, salt);

  const enc = new TextEncoder();
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as any
    },
    key,
    enc.encode(plainText)
  );

  const payload: EncryptedPayload = {
    v: 1,
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(encryptedBuffer),
    timestamp: new Date().toISOString()
  };

  return JSON.stringify(payload);
}

/**
 * Decrypts an encrypted payload JSON string using the user master password
 */
export async function decryptData(encryptedPayloadJson: string, masterPassword: string): Promise<string> {
  if (!masterPassword) {
    throw new Error('Master password is required for decryption');
  }

  try {
    const payload: EncryptedPayload = JSON.parse(encryptedPayloadJson);

    if (!payload.salt || !payload.iv || !payload.ciphertext) {
      throw new Error('Invalid encrypted payload format');
    }

    const salt = new Uint8Array(base64ToArrayBuffer(payload.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));
    const ciphertext = base64ToArrayBuffer(payload.ciphertext);

    const key = await deriveKey(masterPassword, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as any
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err: any) {
    throw new Error('Decryption failed. Incorrect master password or corrupted ciphertext.');
  }
}

/**
 * Generates a random 16-character cross-device transfer sync code
 */
export function generateDeviceTransferKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'FIN-';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) result += '-';
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
