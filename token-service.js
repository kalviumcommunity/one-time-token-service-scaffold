import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

export async function issueToken(payload, ttlSeconds) {
  const tokenId = crypto.randomBytes(16).toString("hex");

  await redis.set(
    `token:${tokenId}`,
    JSON.stringify(payload),
    "EX",
    ttlSeconds
  );

  return tokenId;
}

export async function consumeToken(tokenId) {
  const value = await redis.getdel(`token:${tokenId}`);

  if (value === null) {
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    payload: JSON.parse(value),
  };
}