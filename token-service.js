
import crypto from "crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

/**
 * Generate and store a one-time token.
 */
export async function issueToken(payload, ttlSeconds) {
  // Generate random token ID
  const tokenId = crypto.randomBytes(16).toString("hex");

  // Store payload with expiration atomically
  await redis.set(
    `token:${tokenId}`,
    JSON.stringify(payload),
    "EX",
    ttlSeconds
  );

  return tokenId;
}

/**
 * Consume a token only once.
 */
export async function consumeToken(tokenId) {
  // GETDEL reads and deletes atomically
  const data = await redis.getdel(`token:${tokenId}`);

  // Token does not exist or was already consumed
  if (data === null) {
    return {
      ok: false,
      reason: "invalid"
    };
  }

  // Return the stored payload
  return {
    ok: true,
    payload: JSON.parse(data)
  };
}

export { redis };
