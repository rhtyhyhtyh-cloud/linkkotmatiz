import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import platformsRouter from "./routes/platforms";
import { startTelegramBot } from "./bot/telegram-bot";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Platform links API
  app.use(platformsRouter);

  // Start Telegram Bot
  try {
    startTelegramBot();
    console.log('✅ Telegram bot initialization complete');
  } catch (error) {
    console.error('❌ Failed to start Telegram bot:', error);
  }

  return app;
}
