import pino from "pino";

import { env } from "../../config/env.js";

export const logger = pino({
    level: env.LOG_LEVEL,

    base: {
        service: "payment-infrastructure",
        environment: env.NODE_ENV
    },

    timestamp: pino.stdTimeFunctions.isoTime,

    redact: {
        paths: [
            "password",
            "req.headers.authorization",
            "req.headers.cookie",
            "DATABASE_URL",
            "key_secret",
            "client_secret"
        ],
        censor: "[REDACTED]"
    }
});
