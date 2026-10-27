// test.js
// Prove the service is single-use under concurrency.
//
import assert from "node:assert/strict";
import { issueToken, consumeToken, closeRedis } from "./token-service.js";

async function main() {
  try {
    const id = await issueToken({ userId: 42 }, 60);
    console.log("issued token:", id);

    const results = await Promise.all(
      Array.from({ length: 5 }, () => consumeToken(id)),
    );

    const winners = results.filter((result) => result.ok).length;
    console.log("winners:", winners);
    assert.equal(winners, 1, "token should be consumed exactly once");
    console.log("PASS: token was single-use.");
  } finally {
    await closeRedis();
  }
}

main();
