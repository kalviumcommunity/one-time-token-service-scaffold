import {
    issueToken,
    consumeToken,
    closeRedis
} from "./token-service.js";

async function main() {
    try {
        const tokenId = await issueToken(
            { userId: 42, purpose: "password-reset" },
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
            (result) => result.ok
        ).length;

        console.log("winners:", winners);

        if (winners !== 1) {
            throw new Error(
                `Expected exactly 1 winner, but got ${winners}`
            );
        }

        console.log("PASS: token was single-use.");
    } catch (error) {
        console.error("FAIL:", error);
        process.exitCode = 1;
    } finally {
        await closeRedis();
    }
}

main();