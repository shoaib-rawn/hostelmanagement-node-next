import { Router } from "express";
export const healthRouter = Router();
healthRouter.get("/status", (_req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});
