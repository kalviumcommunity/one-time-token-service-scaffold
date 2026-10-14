import assert from "node:assert/strict";
import { issueToken, consumeToken, closeRedis } from "./token-service.js";

async function main() {
try {
const tokenId = await issueToken(
{ userId: 101, action: "verify-email" },
60
);


console.log("issued token:", tokenId);

const results = await Promise.all([
  consumeToken(tokenId),
  consumeToken(tokenId),
  consumeToken(tokenId),
  consumeToken(tokenId),
  consumeToken(tokenId)
]);

const winners = results.filter(
  (result) => result.ok === true
).length;

console.log("winners:", winners);
assert.equal(winners, 1);
console.log("PASS: token was single-use.");

} catch (error) {
console.error("FAIL:", error);
process.exitCode = 1;
} finally {
await closeRedis();
}
}

main();
