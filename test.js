// test.js
// Prove the service is single-use under concurrency.
//
import assert from "node:assert/strict";
import { issueToken, consumeToken, closeRedis } from "./token-service.js";

async function main() {
  const id = await issueToken({ userId: 42 }, 60);
  console.log("issued token:", id);

  const results = await Promise.all([
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
  ]);

  const winners = results.filter((r) => r.ok).length;
  console.log("winners:", winners); // expect exactly 1

  assert.equal(winners, 1, "SINGLE-USE VIOLATED! winners = " + winners);
  console.log("PASS: token was single-use.");
}

main()
  .catch((error) => {
    console.error("Token service test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeRedis();
  });
