
import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

// Helper: build the Redis key for a token id.
const keyFor = (id) => "token:" + id;

/**
 * Issue a single-use, expiring token.
 */
export async function issueToken(payload, ttlSeconds) {
  // 1. Generate a random 16-byte ID (32 hexadecimal characters)
  const id = crypto.randomBytes(16).toString("hex");

  // 2. Convert payload into JSON string
  const value = JSON.stringify(payload);

  // 3. Store token with expiry and NX condition atomically
  await redis.set(
    keyFor(id),
    value,
    "EX",
    ttlSeconds,
    "NX"
  );

  // 4. Return generated token ID
  return id;
}

/**
 * Consume a token exactly once.
 */
export async function consumeToken(tokenId) {
  // 1. Read and delete token atomically
  const value = await redis.getdel(keyFor(tokenId));

  // 2. Check whether token exists
  if (value === null) {
    return {
      ok: false,
      reason: "invalid"
    };
  }

  // 3. Convert JSON string back into JavaScript object
  return {
    ok: true,
    payload: JSON.parse(value)
  };
}

// Allow other files to close the connection cleanly.
export function closeRedis() {
  return redis.quit();
}
