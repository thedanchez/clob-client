import { createHmac } from "../crypto";

function replaceAll(s: string, search: string, replace: string) {
  return s.split(search).join(replace);
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

  // Use cross-platform HMAC implementation
  const sig = await createHmac(secret, message);

  // NOTE: Must be url safe base64 encoding, but keep base64 "=" suffix
  // Convert '+' to '-'
  // Convert '/' to '_'
  const sigUrlSafe = replaceAll(replaceAll(sig, "+", "-"), "/", "_");
  return sigUrlSafe;
};
