
import { issueToken, consumeToken, closeRedis } from "./token-service.js";

async function main() {
  try {
    const id = await issueToken({ userId: 42 }, 60);
    console.log("issued token:", id);

    // Five consumers attempt to use the same token simultaneously.
    const results = await Promise.all([
      consumeToken(id),
      consumeToken(id),
      consumeToken(id),
      consumeToken(id),
      consumeToken(id),
    ]);

    const winners = results.filter((r) => r.ok).length;
    console.log("winners:", winners);

    if (winners !== 1) {
      throw new Error("SINGLE-USE VIOLATED! winners = " + winners);
    }

    console.log("PASS: token was single-use.");
  } finally {
    await closeRedis();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
