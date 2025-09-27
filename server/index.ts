import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getCloverStatus,
  listCategories,
  listItems,
  getCatalog,
  listStock,
} from "./routes/clover";
import { chatHandler } from "./routes/chat";

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

  // Clover integration endpoints
  app.get("/api/clover/status", getCloverStatus);
  app.get("/api/clover/categories", listCategories);
  app.get("/api/clover/items", listItems);
  app.get("/api/clover/catalog", getCatalog);
  app.get("/api/clover/stock", listStock);
  app.get("/api/clover/item/:id/images", getItemImages);

  // OpenAI chat proxy
  app.post("/api/chat", chatHandler);

  return app;
}
