
import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

// Helper: build the Redis key for a token id.
const keyFor = (id) => "token:" + id;

/**
 * Issue a single-use token that expires after ttlSeconds.
 */
export async function issueToken(payload, ttlSeconds) {
  // 1. Generate a cryptographically secure random ID
  const id = crypto.randomBytes(16).toString("hex");

  // 2. Convert payload to JSON
  const value = JSON.stringify(payload);

  // 3. Store token atomically with expiration and NX
  await redis.set(keyFor(id), value, "EX", ttlSeconds, "NX");

  // 4. Return token ID
  return id;
}

/**
 * Consume a token exactly once.
 */
export async function consumeToken(tokenId) {
  // 1. Atomically read and delete the token
  const value = await redis.getdel(keyFor(tokenId));

  // 2. Token does not exist or has expired
  if (value === null) {
    return {
      ok: false,
      reason: "invalid"
    };
  }

  // 3. Return parsed payload
  return {
    ok: true,
    payload: JSON.parse(value)
  };
}

// Allow other files to close the connection cleanly.
export function closeRedis() {
  return redis.quit();
}
