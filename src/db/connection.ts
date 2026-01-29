import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ramada-bms";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) {
    console.log("[MongoDB] Using existing connection");
    return;
  }

  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGODB_URI, options);
    isConnected = true;
    console.log("[MongoDB] Connected successfully");
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("[MongoDB] Disconnected");
  } catch (error) {
    console.error("[MongoDB] Disconnect error:", error);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on("error", (err) => {
  console.error("[MongoDB] Connection error:", err);
  isConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.log("[MongoDB] Disconnected");
  isConnected = false;
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});
