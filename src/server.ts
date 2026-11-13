import { createServer } from "node:http";
import { app } from "./app.js";
import { logger } from "./core/logger/logger.js";
import { env } from "./config/env.js";
import { prisma } from "./core/database/prisma.js";


const server = createServer(app);

let isShuttingDown = false;

async function shutdown (signal: string) {
    if (isShuttingDown) return;

    isShuttingDown = true;

    logger.info({ signal }, "Shutdown initiated");

    const forceExit = setTimeout(() => {
        logger.fatal("Graceful shutdown timed out");
        process.exit(1);
    }, env.SHUTDOWN_TIMEOUT_MS);

    forceExit.unref();


    try {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => {
                if (error) reject(error);
                else resolve();
            });

            server.closeIdleConnections();
        });

        await prisma.$disconnect();

        logger.info("Application shutdown completed");

        process.exitCode = 0;
    } catch (error) {
        logger.error({ err: error }, "Shutdown failed");
        process.exitCode = 1;
    } finally {
        clearTimeout(forceExit);
    }
}

server.listen(env.PORT, () => {
    logger.info(
        {
            port: env.PORT,
            environment: env.NODE_ENV
        },
        "Payment infrastructure started"
    );
});

server.on("error", (error) => {
    logger.fatal({ err: error }, "HTTP server error");
    process.exitCode = 1;
    void shutdown("SERVER_ERROR");
});

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});

process.on("unhandledRejection", (reason) => {
    logger.fatal({ err: reason }, "Unhandled rejection");
    void shutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught exception");
    void shutdown("UNCAUGHT_EXCEPTION");
});