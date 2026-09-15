// test.js

// Prove the service is single-use under concurrency.

import { issueToken, consumeToken, closeRedis } from "./token-service.js";

async function main() {
  const id = await issueToken({ userId: 42 }, 60);

  console.log("issued token:", id);

  // Fire 5 consumers concurrently with Promise.all
  const results = await Promise.all([
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
    consumeToken(id),
  ]);

  const winners = results.filter((r) => r.ok).length;

  console.log("winners:", winners);

  console.assert(
    winners === 1,
    "SINGLE-USE VIOLATED! winners = " + winners
  );

  if (winners === 1) {
    console.log("PASS: token was single-use.");
  }

  await closeRedis();
}

main();