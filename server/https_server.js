import dotenv from "dotenv";
dotenv.config({
  path: "./config/config.env",
});

import connectDB from "./config/db.config.js";
import app from "./app.js";
import fs from "fs";
import https from "https";

// @desc    Connect to DB
await connectDB();

// @desc    Start Server
const PORT = process.env.PORT || 5000;
const httpsOptions = {
  cert: fs.readFileSync("./config/ssl/anabosi.com.pem"),
  key: fs.readFileSync("./config/ssl/anabosi.com.key"),
};

const server = https.createServer(httpsOptions, app).listen(PORT, function () {
  console.log(`Server has started on PORT: ${PORT} 🎉`);
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error: \n${err}`);
  server.close(() => process.exit(1));
});
