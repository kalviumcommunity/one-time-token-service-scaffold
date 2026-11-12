
// token-service.js
// A single-use, expiring token service backed by Redis.

import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

// Helper: build the Redis key for a token id.
const keyFor = (id) => "token:" + id;

/**
 * Issue a single-use token that expires after ttlSeconds.
 *
 * 1. Generate a random ID.
 * 2. Convert the payload into JSON.
 * 3. Store it in Redis with an expiry.
 * 4. Return the token ID.
 */
export async function issueToken(payload, ttlSeconds) {
  const id = crypto.randomBytes(16).toString("hex");

  const value = JSON.stringify(payload);

  await redis.set(
    keyFor(id),
    value,
    "EX",
    ttlSeconds,
    "NX"
  );

  return id;
}

/**
 * Consume a token exactly once.
 *
 * GETDEL reads and deletes the token atomically.
 */
export async function consumeToken(tokenId) {
  const value = await redis.getdel(keyFor(tokenId));

  if (value === null) {
    return {
      ok: false,
      reason: "invalid"
    };
  }

  return {
    ok: true,
    payload: JSON.parse(value)
  };
}

// Allow other files to close the connection cleanly.
export function closeRedis() {
  return redis.quit();
}
