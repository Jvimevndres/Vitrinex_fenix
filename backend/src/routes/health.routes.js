// backend/src/routes/health.routes.js
import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: error.message,
    });
  }
});

// Liveness probe
router.get("/health/live", (req, res) => {
  res.status(200).json({ status: "alive" });
});

// Readiness probe
router.get("/health/ready", (req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  
  if (isReady) {
    res.status(200).json({ status: "ready" });
  } else {
    res.status(503).json({ status: "not ready" });
  }
});

export default router;
