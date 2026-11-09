
// test.js
// Prove the service is single-use under concurrency.

import { issueToken, consumeToken, closeRedis } from "./token-service.js";

async function main() {
  // 1. Issue one token
  const id = await issueToken({ userId: 42 }, 60);
  console.log("issued token:", id);

  // 2. Fire 5 consumers concurrently
  const results = await Promise.all([
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
  ]);

  // 3. Count successful consumers
  const winners = results.filter((r) => r.ok).length;

  // 4. Print winners count
  console.log("winners:", winners); // expect exactly 1

  // 5. Assert single-use behavior
  console.assert(winners === 1, "SINGLE-USE VIOLATED! winners = " + winners);

  if (winners === 1) {
    console.log("PASS: token was single-use.");
  }

  await closeRedis();
}

main();
