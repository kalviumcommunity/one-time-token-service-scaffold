
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
 * @param {object} payload
 * @param {number} ttlSeconds
 * @returns {Promise<string>}
 */
export async function issueToken(payload, ttlSeconds) {
  // 1. Generate a secure random 32-character ID.
  const tokenId = crypto.randomBytes(16).toString("hex");

  // 2. Convert the payload into JSON.
  const value = JSON.stringify(payload);

  // 3. Store the token with expiry atomically.
  await redis.set(
    keyFor(tokenId),
    value,
    "EX",
    ttlSeconds,
    "NX"
  );

  // 4. Return the token ID.
  return tokenId;
}

/**
 * Consume a token exactly once.
 *
 * @param {string} tokenId
 * @returns {Promise<{ ok: true, payload: object } | { ok: false, reason: string }>}
 */
export async function consumeToken(tokenId) {
  // 1. Read and delete the token atomically.
  const value = await redis.getdel(keyFor(tokenId));

  // 2. Missing token means invalid.
  if (value === null) {
    return { ok: false, reason: "invalid" };
  }

  // 3. Return the parsed payload.
  return {
    ok: true,
    payload: JSON.parse(value)
  };
}

// Allow other files to close the connection cleanly.
export function closeRedis() {
  return redis.quit();
}
