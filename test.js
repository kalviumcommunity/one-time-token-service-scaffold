
import assert from "node:assert/strict";
import { issueToken, consumeToken, closeRedis } from "./token-service.js";

async function main() {
  try {
    const id = await issueToken({ userId: 42 }, 60);
    console.log("issued token:", id);

    const results = await Promise.all([
      consumeToken(id),
      consumeToken(id),
      consumeToken(id),
      consumeToken(id),
      consumeToken(id)
    ]);

    const winners = results.filter((r) => r.ok).length;
    console.log("winners:", winners);

    assert.equal(winners, 1, "SINGLE-USE VIOLATED!");

    console.log("PASS: token was single-use.");
  } finally {
    await closeRedis();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
