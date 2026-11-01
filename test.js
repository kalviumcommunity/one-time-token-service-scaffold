import assert from "node:assert/strict";
import { issueToken, consumeToken } from "./token-service.js";

async function test() {
  const payload = {
    userId: 101,
    email: "test@example.com"
  };

  // Issue one token
  const tokenId = await issueToken(payload, 60);

  console.log("issued token:", tokenId);

  // Fire 5 consumers simultaneously
  const results = await Promise.all(
    Array.from({ length: 5 }, () => consumeToken(tokenId))
  );

  // Count successful consumers
  const winners = results.filter(result => result.ok === true).length;

  console.log("winners:", winners);

  // Exactly one consumer must win
  assert.equal(winners, 1);

  // Verify the successful consumer received the payload
  const winner = results.find(result => result.ok === true);

  assert.deepEqual(winner.payload, payload);

  // Verify the remaining consumers were rejected
  const losers = results.filter(result => result.ok === false);

  assert.equal(losers.length, 4);

  for (const result of losers) {
    assert.equal(result.reason, "invalid");
  }

  console.log("PASS: token was single-use.");
}

test().catch(error => {
  console.error(error);
  process.exitCode = 1;
});