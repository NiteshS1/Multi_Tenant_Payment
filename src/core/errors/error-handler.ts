import type { ErrorRequestHandler } from "express";

import { AppError } from "./app-error.js";
import { logger } from "../logger/logger.js";
import { env } from "../../config/env.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  _next
) => {
  if (res.headersSent) {
    return;
  }

  const isOperational = error instanceof AppError;

  const statusCode = isOperational
    ? error.statusCode
    : 500;

  const code = isOperational
    ? error.code
    : "INTERNAL_SERVER_ERROR";

  if (statusCode >= 500) {
    logger.error(
      {
        err: error,
        requestId: req.id
      },
      "Request failed"
    );
  }

  res.status(statusCode).json({
    success: false,

    error: {
      code, message: isOperational
        ? error.message
        : "An unexpected error occurred"
    },

    requestId: req.id,

    ...(env.NODE_ENV === "development" && {
      stack: error.stack
    })
  });
};