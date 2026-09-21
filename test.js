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

console.assert(
    winners === 1,
    "SINGLE-USE VIOLATED!"
);

if (winners === 1) {
    console.log("PASS: token was single-use.");
} else {
    console.log("FAIL: token was consumed more than once.");
    process.exit(1);
}

process.exit(0);

