
import assert from "node:assert/strict";
import { issueToken, consumeToken, redis } from "./token-service.js";

async function run() {
  try {
    // 1. Issue one token
    const payload = {
      userId: 101,
      action: "password-reset"
    };

    const tokenId = await issueToken(payload, 60);

    console.log("issued token:", tokenId);

    // 2. Five consumers attempt simultaneously
    const results = await Promise.all([
      consumeToken(tokenId),
      consumeToken(tokenId),
      consumeToken(tokenId),
      consumeToken(tokenId),
      consumeToken(tokenId)
    ]);

    // 3. Count successful consumers
    const winners = results.filter(result => result.ok).length;

    console.log("winners:", winners);

    // 4. Assert exactly one consumer succeeds
    assert.equal(winners, 1, "Exactly one consumer must win");

    console.log("PASS: token was single-use.");

  } catch (error) {
    console.error("FAIL:", error.message);
    process.exitCode = 1;
  } finally {
    redis.disconnect();
  }
}

run();
