# One-Time Token Service — Completed Assignment

A single-use, expiring token service backed by Redis.

## Setup

```bash
npm install
cp .env.example .env
# Set REDIS_URL in .env
docker start redis-m4
```

## Implementation

- `issueToken(payload, ttlSeconds)` generates a 128-bit random token ID using
  `crypto.randomBytes(16).toString("hex")`, serializes the payload with
  `JSON.stringify`, and stores it using one atomic `SET ... EX ... NX` command.
- `consumeToken(tokenId)` uses Redis `GETDEL` to read and delete the token
  atomically. It returns `{ ok: true, payload }` on success or
  `{ ok: false, reason: "invalid" }` when the token is missing or expired.
- `test.js` launches five `consumeToken` calls concurrently with `Promise.all`
  and asserts that exactly one succeeds.

## Run the test

```bash
npm test
```

Expected successful output:

```text
issued token: <32-character-hex-token>
winners: 1
PASS: token was single-use.
```

**Observed result:** Run `npm test` against your configured Redis instance and
paste the actual output showing `winners: 1` into your GitHub PR description.
The expected output above is not a claim that the test has already been run.

## Submit

Push the completed `token-service.js`, `test.js`, and this README to your fork,
then open a Pull Request and submit its URL in Kalvium.
