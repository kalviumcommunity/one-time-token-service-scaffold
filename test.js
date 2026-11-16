
// test.js

import assert from "node:assert/strict";

import {
  issueToken,
  consumeToken,
  closeRedis
} from "./token-service.js";

async function main() {
  try {
    // 1. Issue one token
    const id = await issueToken({ userId: 42 }, 60);

    console.log("issued token:", id);

    // 2. Fire five consumers simultaneously
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

    // 4. Assert exactly one consumer wins
    assert.equal(winners, 1, "Token must be single-use");

    console.log("PASS: token was single-use.");

  } finally {
    // 5. Close Redis connection
    await closeRedis();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
