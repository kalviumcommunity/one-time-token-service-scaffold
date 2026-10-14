import crypto from "crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

export async function issueToken(payload, ttlSeconds) {
  const tokenId = crypto.randomBytes(16).toString("hex");
  // One atomic command: value + TTL together
  await redis.set(`token:${tokenId}`, JSON.stringify(payload), "EX", ttlSeconds);
  return tokenId;
}

export async function consumeToken(tokenId) {
  // One atomic command: read and delete together
  const raw = await redis.getdel(`token:${tokenId}`);
  if (raw === null) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true, payload: JSON.parse(raw) };
}

export async function closeRedis() {
  await redis.quit();
}