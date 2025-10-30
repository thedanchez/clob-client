import { isBrowser } from "../utilities";

function replaceAll(s: string, search: string, replace: string) {
  return s.split(search).join(replace);
}

// Node.js/Bun/Deno HMAC implementation
export async function createHmacNode(secret: string, message: string) {
  const crypto = await import("crypto");
  const base64Secret = Buffer.from(secret, "base64");
  const hmac = crypto.createHmac("sha256", base64Secret);
  return hmac.update(message).digest("base64");
}

// Browser HMAC implementation using Web Crypto API
export async function createHmacBrowser(secret: string, message: string) {
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
}

/**
 * Builds the canonical Polymarket CLOB HMAC signature
 * @param secret - Base64 encoded secret key
 * @param timestamp - Unix timestamp
 * @param method - HTTP method
 * @param requestPath - Request path
 * @param body - Optional request body
 * @returns Promise<string> - URL-safe base64 encoded signature
 */
export const buildPolyHmacSignature = async (
  secret: string,
  timestamp: number,
  method: string,
  requestPath: string,
  body?: string,
): Promise<string> => {
  let message = timestamp + method + requestPath;

  if (body !== undefined) {
    message += body;
  }

  // Use appropriate HMAC implementation based on environment
  const sig = isBrowser()
    ? await createHmacBrowser(secret, message)
    : await createHmacNode(secret, message);

  // NOTE: Must be url safe base64 encoding, but keep base64 "=" suffix
  // Convert '+' to '-'
  // Convert '/' to '_'
  const sigUrlSafe = replaceAll(replaceAll(sig, "+", "-"), "/", "_");
  return sigUrlSafe;
};
