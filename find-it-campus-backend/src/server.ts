import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import { notFound, errorHandler } from "./middleware/errorMiddleware";

import authRoutes from "./routes/authRoutes";
import itemRoutes from "./routes/itemRoutes";
import claimRoutes from "./routes/claimRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Find It Campus API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Find It Campus API listening on port ${PORT}`);
  });
};

start();
