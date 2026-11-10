
 // test.js
 // Prove the service is single-use under concurrency.

import {
  issueToken,
  consumeToken,
  closeRedis
} from "./token-service.js";

async function main() {
  try {
    // 1. Issue one token.
    const id = await issueToken({ userId: 42 }, 60);

    console.log("issued token:", id);

    // 2. Fire five consumers concurrently.
    const results = await Promise.all([
      consumeToken(id),
      consumeToken(id),
      consumeToken(id),
      consumeToken(id),
      consumeToken(id)
    ]);

    // 3. Count successful consumers.
    const winners = results.filter((r) => r.ok).length;

    console.log("winners:", winners);

    // 4. Assert exactly one winner.
    console.assert(
      winners === 1,
      "SINGLE-USE VIOLATED! winners = " + winners
    );

    if (winners === 1) {
      console.log("PASS: token was single-use.");
    } else {
      process.exitCode = 1;
    }
  } finally {
    // 5. Close Redis connection.
    await closeRedis();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
