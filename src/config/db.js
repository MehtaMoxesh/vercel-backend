import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected:", conn.connection.host);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err; // ✅ DO NOT exit process
  }
};

export default connectDB;
