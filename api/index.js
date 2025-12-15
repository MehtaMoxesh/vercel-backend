import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import connectDB from "../src/config/db.js";
import authRoutes from "../src/routes/auth.js";
import sweetsRoutes from "../src/routes/sweets.js";
import cartRoutes from "../src/routes/cart.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Connect DB SAFELY (inside handler scope)
await connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/sweets", sweetsRoutes);
app.use("/api/cart", cartRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Sweet Shop Backend Running 🚀");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

// ✅ REQUIRED for Vercel
export default app;
