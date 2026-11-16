
// token-service.js

import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

// Helper function to create Redis key
const keyFor = (id) => "token:" + id;

// Generate and store a one-time token
export async function issueToken(payload, ttlSeconds) {
  const id = crypto.randomBytes(16).toString("hex");

  const value = JSON.stringify(payload);

  await redis.set(keyFor(id), value, "EX", ttlSeconds);

  return id;
}

// Read and delete the token atomically
export async function consumeToken(tokenId) {
  const value = await redis.getdel(keyFor(tokenId));

  if (value === null) {
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    payload: JSON.parse(value)
  };
}

// Close Redis connection
export function closeRedis() {
  return redis.quit();
}
