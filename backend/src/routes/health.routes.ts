import { Router } from "express";
import { prisma } from "../lib/prisma";

export const healthRouter = Router();

// Liveness: server zinda hai?
healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness: server database tak pohanch sakta hai?
healthRouter.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ready", database: "up" });
  } catch (err) {
    req.log.error({ err }, "Database readiness check failed");
    res.status(503).json({ status: "not_ready", database: "down" });
  }
});
