
import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

const keyFor = (id) => "token:" + id;

// Generate and store a single-use token
export async function issueToken(payload, ttlSeconds) {
    // 1. Generate random token ID
    const id = crypto.randomBytes(16).toString("hex");

    // 2. Convert payload into JSON string
    const value = JSON.stringify(payload);

    // 3. Store token in Redis with expiry
    await redis.set(keyFor(id), value, "EX", ttlSeconds, "NX");

    // 4. Return token ID
    return id;
}

// Consume token only once
export async function consumeToken(tokenId) {
    // 1. Get and delete token in one command
    const value = await redis.getdel(keyFor(tokenId));

    // 2. Check if token exists
    if (value === null) {
        return {
            ok: false,
            reason: "invalid"
        };
    }

    // 3. Return stored payload
    return {
        ok: true,
        payload: JSON.parse(value)
    };
}

// Close Redis connection
export function closeRedis() {
    return redis.quit();
}
