
import assert from "node:assert/strict";
import { issueToken, consumeToken } from "./token-service.js";

const id = await issueToken({ userId: 42 }, 60);

console.log("issued token:", id);

const results = await Promise.all([
  consumeToken(id),
  consumeToken(id),
  consumeToken(id),
  consumeToken(id),
  consumeToken(id)
]);

const winners = results.filter((result) => result.ok).length;

console.log("winners:", winners);

assert.equal(winners, 1, "Token must be used only once.");

console.log("PASS: token was single-use.");

process.exit(0);
