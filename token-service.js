// token-service.js
// A single-use, expiring token service backed by Redis.

import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);
const keyFor = (id) => "token:" + id;

/**
 * Issue a single-use token that expires after ttlSeconds.
 * Stores the JSON payload and TTL atomically.
 */
export async function issueToken(payload, ttlSeconds) {
  const tokenId = crypto.randomBytes(16).toString("hex");
  const value = JSON.stringify(payload);

  await redis.set(keyFor(tokenId), value, "EX", ttlSeconds, "NX");
  return tokenId;
}

/**
 * Consume a token exactly once using Redis' atomic GETDEL command.
 */
export async function consumeToken(tokenId) {
  const value = await redis.getdel(keyFor(tokenId));

  if (value === null) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, payload: JSON.parse(value) };
}

// Allow other files to close the connection cleanly.
export function closeRedis() {
  return redis.quit();
}
