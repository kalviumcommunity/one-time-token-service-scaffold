
import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

const keyFor = (id) => "token:" + id;

export async function issueToken(payload, ttlSeconds) {
  const id = crypto.randomBytes(16).toString("hex");
  const value = JSON.stringify(payload);

  const result = await redis.set(
    keyFor(id),
    value,
    "EX",
    ttlSeconds,
    "NX"
  );

  if (result !== "OK") {
    return issueToken(payload, ttlSeconds);
  }

  return id;
}

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

export function closeRedis() {
  return redis.quit();
}

