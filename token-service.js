// token-service.js
// A single-use, expiring token service backed by Redis.
//
// You implement the two functions below. The lesson walks through the exact
// pattern — this file is just the shape to fill in.


import crypto from "crypto";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

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
    const result = await redis.getdel(`token:${tokenId}`);

    if (result === null) {
        return {
            ok: false,
            reason: "invalid"
        };
    }

    return {
        ok: true,
        payload: JSON.parse(result)
    };
}

export { redis };

