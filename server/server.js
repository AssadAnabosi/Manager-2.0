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

process.on("unhandledRejection", (err, promise) => {
  console.log(`⚠️  Logged Error: \n${err}`);
  server.close(() => process.exit(1));
  console.log(`☢️  Server Closed`);
});
