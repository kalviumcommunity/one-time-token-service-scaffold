// test.js
// Prove the service is single-use under concurrency.
//
// TODO:
//   1. Issue one token.
//   2. Fire 5 consumeToken calls AT ONCE with Promise.all.
//   3. Count how many returned { ok: true } and assert it is exactly 1.
//   4. Print the winners count so it shows in the output.



import dotenv from "dotenv";
import assert from "assert";
import { issueToken, consumeToken, redis } from "./token-service.js";

dotenv.config();

async function testOneTimeToken() {
    try {
        const payload = {
            userId: 101,
            username: "Bharath"
        };

        // Issue one token
        const tokenId = await issueToken(payload, 60);

        console.log("issued token:", tokenId);

        // Five concurrent consumers
        const results = await Promise.all([
            consumeToken(tokenId),
            consumeToken(tokenId),
            consumeToken(tokenId),
            consumeToken(tokenId),
            consumeToken(tokenId)
        ]);

        // Count successful consumers
        const winners = results.filter(result => result.ok).length;

        console.log("winners:", winners);

        // Verify exactly one winner
        assert.strictEqual(winners, 1);

        console.log("PASS: token was single-use.");

    } catch (error) {
        console.error("FAIL:", error);
        process.exitCode = 1;

    } finally {
        await redis.quit();
    }
}

testOneTimeToken();


