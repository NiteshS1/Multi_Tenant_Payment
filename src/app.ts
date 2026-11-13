import express from "express";
import { pinoHttp } from "pino-http";

import { logger } from "./core/logger/logger.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { notFoundHandler } from "./core/errors/not-found-handler.js";
import { errorHandler } from "./core/errors/error-handler.js";

export const app = express();

app.disable("x-powered-by");

app.use(
    pinoHttp({
        logger,
        genReqId: (req) =>
            req.headers["x-request-id"]?.toString() ||
            crypto.randomUUID()
    })
);

app.use(express.json({
    limit: "1mb"
}));

app.use(express.urlencoded({
    extended: false,
    limit: "1mb"
}));

app.use("/health", healthRouter);

app.use(notFoundHandler);

app.use(errorHandler);