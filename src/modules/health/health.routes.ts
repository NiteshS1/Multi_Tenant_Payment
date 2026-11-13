import { Router } from "express";
import { prisma } from "../../core/database/prisma.js";

export const healthRouter = Router();

healthRouter.get("/live", (_req, res) => {
    res.status(200).json({
        success: true,
        status: "alive",
        timestamp: new Date().toISOString()
    });
});

healthRouter.get("/ready", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            success: true,
            status: "ready",
            checks: {
                database: "connected"
            },
            timestamp: new Date().toISOString()
        });
    } catch {
        res.status(503).json({
            success: false,
            status: "not_ready",
            checks: {
                database: "disconnected"
            },
            timestamp: new Date().toISOString()
        });
    }
});