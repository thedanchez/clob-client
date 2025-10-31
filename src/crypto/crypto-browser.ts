/**
 * Browser crypto utilities using Web Crypto API
 * This module should only be imported in browser environments
 */

type HashAlgorithm = "sha1" | "sha256" | "sha384" | "sha512";

const algorithmMap: Record<HashAlgorithm, string> = {
  sha1: "SHA-1",
  sha256: "SHA-256",
  sha384: "SHA-384",
  sha512: "SHA-512",
};

export const createHash = async (algorithm: string, data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const cryptoAlgorithm = algorithmMap[algorithm as HashAlgorithm];
  if (!cryptoAlgorithm) {
    throw new Error(`Unsupported hash algorithm: ${algorithm}`);
  }

  const hashBuffer = await window.crypto.subtle.digest(cryptoAlgorithm, dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const createHmac = async (secret: string, message: string): Promise<string> => {
  // Decode base64 secret
  const binarySecret = Uint8Array.from(atob(secret), (c) => c.charCodeAt(0));

  // Import the key
  const key = await window.crypto.subtle.importKey(
    "raw",
    binarySecret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  // Create message buffer
  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(message);

  // Sign the message
  const signature = await window.crypto.subtle.sign("HMAC", key, messageBuffer);

  // Convert to base64
  const signatureArray = new Uint8Array(signature);
  let binary = "";

  for (let i = 0; i < signatureArray.byteLength; i++) {
    binary += String.fromCharCode(signatureArray[i]!);
  }

  return btoa(binary);
};
