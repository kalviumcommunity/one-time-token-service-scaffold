import { issueToken, consumeToken } from "./token-service.js";

const id = await issueToken(
  {
    userId: 42,
    purpose: "password-reset"
  },
  60
);

console.log("Token:", id);

const results = await Promise.all([
  consumeToken(id),
  consumeToken(id),
  consumeToken(id),
  consumeToken(id),
  consumeToken(id)
]);

console.log("Results:", results);

const winners = results.filter((result) => result.ok).length;

console.log("winners:", winners);

console.assert(
  winners === 1,
  "SINGLE-USE VIOLATED!"
);

process.exit(0);