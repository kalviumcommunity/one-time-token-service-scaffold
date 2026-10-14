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

const winners = results.filter((r) => r.ok).length;

console.log("winners:", winners);

if (winners !== 1) {
  throw new Error("SINGLE-USE VIOLATED!");
}

console.log("PASS: token was single-use.");
process.exit(0);