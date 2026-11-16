
import { issueToken, consumeToken, closeRedis } from "./token-service.js";

async function main() {
    // 1. Create one token
    const id = await issueToken({ userId: 42 }, 60);
    console.log("issued token:", id);

    // 2. Run 5 consumeToken calls at the same time
    const results = await Promise.all([
        consumeToken(id),
        consumeToken(id),
        consumeToken(id),
        consumeToken(id),
        consumeToken(id)
    ]);

    // 3. Count successful consumers
    const winners = results.filter((r) => r.ok).length;

    console.log("winners:", winners);

    // 4. Check whether only one user consumed the token
    console.assert(winners === 1, "SINGLE-USE VIOLATED! winners = " + winners);

    if (winners === 1) {
        console.log("PASS: token was single-use.");
    }

    await closeRedis();
}

main();
