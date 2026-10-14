import { issueToken, consumeToken, closeRedis } from "./token-service.js";

async function main() {
  const tokenId = await issueToken({ userId: 42, action: "reset-password" }, 60);
  console.log("issued token:", tokenId);

  // Fire 5 consumers at once
  const results = await Promise.all([
    consumeToken(tokenId),
    consumeToken(tokenId),
    consumeToken(tokenId),
    consumeToken(tokenId),
    consumeToken(tokenId),
  ]);

  const winners = results.filter((r) => r.ok === true).length;
  console.log("winners:", winners);

  if (winners !== 1) {
    console.error("FAIL: expected exactly one winner");
    process.exitCode = 1;
  } else {
    console.log("PASS: token was single-use.");
  }

  await closeRedis();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});