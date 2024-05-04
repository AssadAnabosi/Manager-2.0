console.log(`Environment: ${process.env.ENV}  🏳️`);

import connectDB from "./config/db.config.js";
import app from "./app";

// @desc    Connect to DB
await connectDB();

// @desc    Start Server
const server = Bun.serve({
  fetch(req, server) {
    return app.fetch(req, { ip: server.requestIP(req) });
  },
});

console.log(`Server has started on PORT: ${server.port} 🎉`);
