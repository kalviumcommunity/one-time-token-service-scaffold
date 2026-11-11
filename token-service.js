
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
 */
export async function issueToken(payload, ttlSeconds) {
  // 1. Generate a random 32-character hexadecimal ID.
  const id = crypto.randomBytes(16).toString("hex");

  // 2. Convert the payload into a JSON string.
  const value = JSON.stringify(payload);

  // 3. Store the token with an expiry using one atomic command.
  await redis.set(keyFor(id), value, "EX", ttlSeconds, "NX");

  // 4. Return the token ID.
  return id;
}

/**
 * Consume a token exactly once.
 */
export async function consumeToken(tokenId) {
  // 1. Get and delete the token in one atomic command.
  const value = await redis.getdel(keyFor(tokenId));

  // 2. If the token does not exist, return invalid.
  if (value === null) {
    return { ok: false, reason: "invalid" };
  }

  // 3. Convert the stored JSON string back into an object.
  return { ok: true, payload: JSON.parse(value) };
}

// Allow other files to close the connection cleanly.
export function closeRedis() {
  return redis.quit();
}
