console.log(`Environment: ${process.env.NODE_ENV}  🏳️`);

import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production")
  dotenv.config({
    path: "./config/config.env",
  });

import connectDB from "./config/db.config.js";
import app from "./app.js";

// @desc    Connect to DB
await connectDB();

// @desc    Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server has started on PORT: ${PORT} 🎉`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log(`⚠️  Unhandled Rejection`);
  console.log(`📌  Reason: ${reason}`);
  console.log(`📌  Promise(at): ${JSON.stringify(promise)}`);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (exception, origin) => {
  console.log(`⚠️  Uncaught Exception`);
  console.log(`📌  Caught exception: ${exception}`);
  console.log(`📌  Exception origin: ${origin}`);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("⚠️  SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log(`☢️  Server Closed`);
    process.exit(1);
  });
});

process.on("SIGINT", () => {
  console.log("⚠️  SIGINT received. Shutting down gracefully");
  server.close(() => {
    console.log(`☢️  Server Closed`);
    process.exit(1);
  });
});

process.on("SIGUSR2", () => {
  console.log("⚠️  SIGUSR2 received. Shutting down gracefully");
  server.close(() => {
    console.log(`☢️  Server Closed`);
    process.exit(1);
  });
});

process.on("exit", () => {
  console.log(`☢️  Process Exited`);
});
