// token-service.js
// A single-use, expiring token service backed by Redis.

import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

// Helper: build the Redis key for a token id.
const keyFor = (id) => "token:" + id;

/**
 * Issue a single-use token that expires after `ttlSeconds`.
 *
 * @param {object} payload      Any JSON-serialisable data (e.g. { userId: 42 }).
 * @param {number} ttlSeconds   Seconds until the token expires.
 * @returns {Promise<string>}   The token id to hand to the user.
 */
export async function issueToken(payload, ttlSeconds) {
  // 1. Generate a 32-character random hex id
  const tokenId = crypto.randomBytes(16).toString("hex");

  // 2. Convert payload object to JSON string
  const value = JSON.stringify(payload);

  // 3. Store under keyFor(tokenId) with TTL atomically
  await redis.set(keyFor(tokenId), value, "EX", ttlSeconds, "NX");

  // 4. Return the token id string
  return tokenId;
}

/**
 * Consume a token exactly once.
 *
 * @param {string} tokenId
 * @returns {Promise<{ ok: true, payload: object } | { ok: false, reason: string }>}
 */
export async function consumeToken(tokenId) {
  // 1. Read AND delete the token in ONE atomic command
  const value = await redis.getdel(keyFor(tokenId));

  // 2. If token is missing/expired, return invalid response
  if (value === null) {
    return { ok: false, reason: "invalid" };
  }

  // 3. Return the parsed payload
  return { ok: true, payload: JSON.parse(value) };
}

// Allow other files to close the connection cleanly (used by test.js).
export function closeRedis() {
  return redis.quit();
}