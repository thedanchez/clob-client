/**
 * Node.js/Bun/Deno crypto utilities
 * This module should only be imported in server environments
 */

export const createHash = async (algorithm: string, data: string): Promise<string> => {
  const crypto = await import("crypto");
  return crypto.createHash(algorithm).update(data).digest("hex");
};

export const createHmac = async (secret: string, message: string): Promise<string> => {
  const crypto = await import("crypto");
  const base64Secret = Buffer.from(secret, "base64");
  const hmac = crypto.createHmac("sha256", base64Secret);
  return hmac.update(message).digest("base64");
};
