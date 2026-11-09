// token-service.js
// A single-use, expiring token service backed by Redis.
//
// You implement the two functions below. The lesson walks through the exact
// pattern — this file is just the shape to fill in.

import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

// Helper: build the Redis key for a token id.
const keyFor = (id) => "token:" + id;

/**
 * Issue a single-use token that expires after `ttlSeconds`.
 *
 * TODO:
 *   1. Generate a random id: crypto.randomBytes(16).toString("hex")  -> 32 hex chars
 *   2. JSON.stringify the payload.
 *   3. Store it under keyFor(id) with a TTL, in ONE atomic command:
 *        await redis.set(keyFor(id), value, "EX", ttlSeconds, "NX");
 *   4. Return the token id string.
 *
 * @param {object} payload      Any JSON-serialisable data (e.g. { userId: 42 }).
 * @param {number} ttlSeconds   Seconds until the token expires.
 * @returns {Promise<string>}   The token id to hand to the user.
 */
export async function issueToken(payload, ttlSeconds) {
  // Generate a secure random token
  const tokenId = crypto.randomBytes(16).toString("hex");

  // Convert payload into JSON
  const value = JSON.stringify(payload);

  // Store token in Redis with expiry
  await redis.set(
    keyFor(tokenId),
    value,
    "EX",
    ttlSeconds,
    "NX"
  );

  // Return token ID
  return tokenId;
}

/**
 * Consume a token exactly once.
 *
 * TODO:
 *   1. Read AND delete the token in ONE atomic command:
 *        const value = await redis.getdel(keyFor(tokenId));
 *   2. If value is null -> return { ok: false, reason: "invalid" }.
 *   3. Otherwise -> return { ok: true, payload: JSON.parse(value) }.
 *
 * Do NOT use GET then DEL as two separate commands — that races.
 *
 * @param {string} tokenId
 * @returns {Promise<{ ok: true, payload: object } | { ok: false, reason: string }>}
 */
export async function consumeToken(tokenId) {
  // Read and delete token atomically
  const value = await redis.getdel(keyFor(tokenId));

  // Token doesn't exist
  if (value === null) {
    return { ok: false, reason: "invalid" };
  }

  // Return token payload
  return {
    ok: true,
    payload: JSON.parse(value)
  };
}

// Allow other files to close the connection cleanly (used by test.js).
export function closeRedis() {
  return redis.quit();
}
