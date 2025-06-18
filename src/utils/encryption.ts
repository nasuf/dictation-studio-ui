/**
 * Password Encryption and Security Utilities
 *
 * This module provides secure password encryption functionality using PBKDF2 algorithm
 * that is consistent with the backend implementation.
 *
 * Security Features:
 * - Uses PBKDF2-HMAC-SHA256 algorithm
 * - 32-byte random salt
 * - 100,000 iterations (consistent with backend)
 * - Supports client-side password verification
 *
 * Usage Examples:
 *
 * // Encrypt password for registration
 * const registrationData = await prepareSecureRegistration(
 *   "username",
 *   "user@example.com",
 *   "plainPassword",
 *   "avatarUrl"
 * );
 *
 * // Use secure API for registration
 * await api.registerSecure(
 *   registrationData.username,
 *   registrationData.email,
 *   registrationData.encryptedPassword,
 *   registrationData.avatar
 * );
 *
 * // Verify password
 * const isValid = await validatePasswordSecure(
 *   "plainPassword",
 *   "storedSalt:storedHash"
 * );
 *
 * Notes:
 * - Current project primarily uses Supabase authentication, password security is handled by Supabase
 * - These functions provide additional security layer for direct backend API calls
 * - All passwords are encrypted during transmission via HTTPS
 */

// Generate random salt
export function generateSalt(length: number = 32): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// Convert Uint8Array to hex string
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

// Convert hex string to Uint8Array
export function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Use PBKDF2 for password encryption (consistent with backend)
export async function encryptPasswordSecure(
  password: string,
  saltHex?: string
): Promise<{ hash: string; salt: string }> {
  try {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Use provided salt or generate new salt
    const salt = saltHex ? hexToUint8Array(saltHex) : generateSalt(32);

    // Import password as CryptoKey
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      passwordData,
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    // Use PBKDF2 to derive key (consistent with backend: SHA-256, 100000 iterations)
    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      passwordKey,
      256 // 32 bytes * 8 bits = 256 bits
    );

    const hashHex = arrayBufferToHex(derivedKey);
    const saltHex_result = arrayBufferToHex(salt.buffer);

    return {
      hash: hashHex,
      salt: saltHex_result,
    };
  } catch (error) {
    console.error("Password encryption failed:", error);
    throw new Error("Password encryption failed");
  }
}

// Verify password (for client-side verification)
export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  try {
    const { hash } = await encryptPasswordSecure(password, storedSalt);
    return hash === storedHash;
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}

// Keep old function for backward compatibility but mark as deprecated
/**
 * @deprecated Use encryptPasswordSecure instead, this function uses insecure SHA-256
 */
export async function encryptPassword(password: string): Promise<string> {
  console.warn(
    "encryptPassword is deprecated. Use encryptPasswordSecure instead."
  );
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Format password for backend transmission (salt:hash format)
export function formatPasswordForBackend(salt: string, hash: string): string {
  return `${salt}:${hash}`;
}

// Parse password format from backend
export function parsePasswordFromBackend(
  passwordString: string
): { salt: string; hash: string } | null {
  const parts = passwordString.split(":");
  if (parts.length === 2) {
    return {
      salt: parts[0],
      hash: parts[1],
    };
  }
  return null;
}

// Secure registration helper function
export async function prepareSecureRegistration(
  username: string,
  email: string,
  password: string,
  avatar: string
): Promise<{
  username: string;
  email: string;
  encryptedPassword: string;
  avatar: string;
}> {
  const { hash, salt } = await encryptPasswordSecure(password);
  const encryptedPassword = formatPasswordForBackend(salt, hash);

  return {
    username,
    email,
    encryptedPassword,
    avatar,
  };
}

// Secure password validation helper function (for client-side validation)
export async function validatePasswordSecure(
  password: string,
  storedPasswordString: string
): Promise<boolean> {
  const parsed = parsePasswordFromBackend(storedPasswordString);
  if (!parsed) {
    return false;
  }

  return await verifyPassword(password, parsed.hash, parsed.salt);
}

// Convert ArrayBuffer to Base64 string (shorter than hex)
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string to Uint8Array
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Compact password encryption for Supabase (shorter output)
export async function encryptPasswordCompact(
  password: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Use shorter salt (16 bytes instead of 32) for Supabase compatibility
    const salt = generateSalt(16);

    // Import password as CryptoKey
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      passwordData,
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    // Use PBKDF2 to derive key (reduced iterations for shorter processing)
    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 50000, // Reduced from 100000 for balance of security and performance
        hash: "SHA-256",
      },
      passwordKey,
      128 // 16 bytes * 8 bits = 128 bits (shorter hash)
    );

    // Use Base64 encoding for more compact representation
    const saltBase64 = arrayBufferToBase64(salt.buffer);
    const hashBase64 = arrayBufferToBase64(derivedKey);

    // Format: salt.hash (using dot separator for shorter string)
    const compactPassword = `${saltBase64}.${hashBase64}`;

    // Ensure it's under 72 characters
    if (compactPassword.length > 72) {
      throw new Error("Encrypted password still too long for Supabase");
    }

    return compactPassword;
  } catch (error) {
    console.error("Compact password encryption failed:", error);
    throw new Error("Password encryption failed");
  }
}

// Verify compact encrypted password
export async function verifyPasswordCompact(
  password: string,
  storedCompactPassword: string
): Promise<boolean> {
  try {
    const parts = storedCompactPassword.split(".");
    if (parts.length !== 2) {
      return false;
    }

    const [saltBase64, storedHashBase64] = parts;
    const salt = base64ToUint8Array(saltBase64);

    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    const passwordKey = await crypto.subtle.importKey(
      "raw",
      passwordData,
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 50000,
        hash: "SHA-256",
      },
      passwordKey,
      128
    );

    const hashBase64 = arrayBufferToBase64(derivedKey);
    return hashBase64 === storedHashBase64;
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}

// Deterministic password encryption for Supabase (same password + email = same result)
export async function encryptPasswordDeterministic(
  password: string,
  email: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Use email as deterministic salt (same email always produces same salt)
    const emailData = encoder.encode(email.toLowerCase().trim());

    // Create a fixed-length salt from email using SHA-256
    const emailHashBuffer = await crypto.subtle.digest("SHA-256", emailData);
    const emailHash = new Uint8Array(emailHashBuffer);

    // Use first 16 bytes of email hash as salt for consistency
    const salt = emailHash.slice(0, 16);

    // Import password as CryptoKey
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      passwordData,
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    // Use PBKDF2 to derive key
    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 50000, // Balance of security and performance
        hash: "SHA-256",
      },
      passwordKey,
      128 // 16 bytes * 8 bits = 128 bits
    );

    // Use Base64 encoding for compact representation
    const saltBase64 = arrayBufferToBase64(salt.buffer);
    const hashBase64 = arrayBufferToBase64(derivedKey);

    // Format: salt.hash (using dot separator)
    const deterministicPassword = `${saltBase64}.${hashBase64}`;

    // Ensure it's under 72 characters
    if (deterministicPassword.length > 72) {
      throw new Error("Encrypted password too long for Supabase");
    }

    return deterministicPassword;
  } catch (error) {
    console.error("Deterministic password encryption failed:", error);
    throw new Error("Password encryption failed");
  }
}

// Verify deterministic encrypted password
export async function verifyPasswordDeterministic(
  password: string,
  email: string,
  storedPassword: string
): Promise<boolean> {
  try {
    const encryptedPassword = await encryptPasswordDeterministic(
      password,
      email
    );
    return encryptedPassword === storedPassword;
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}
