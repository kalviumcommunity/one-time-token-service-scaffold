import assert from "node:assert/strict";
import { issueToken, consumeToken } from "./token-service.js";

const payload = {
  userId: "user123",
  action: "password-reset",
};

const tokenId = await issueToken(payload, 60);

console.log("issued token:", tokenId);

const results = await Promise.all([
  consumeToken(tokenId),
  consumeToken(tokenId),
  consumeToken(tokenId),
  consumeToken(tokenId),
  consumeToken(tokenId),
]);

const winners = results.filter((result) => result.ok === true).length;

console.log("winners:", winners);

assert.equal(winners, 1, "Exactly one consumer must win");

console.log("PASS: token was single-use.");
process.exit(0);