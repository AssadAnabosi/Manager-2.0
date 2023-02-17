import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import APIRoutes from "./routes/index.js";
import errorHandler from "./middleware/error.middleware.js";
import credentials from "./middleware/allowCredentials.middleware.js";
import corsOptions from "./config/cors.config.js";

const app = express();
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// @desc    Health Check route
app.use("/healthcheck", (req, res) => {
  return res.sendStatus(200);
});

// @desc    Serving API routes
app.use("/api", APIRoutes);

// @desc    Error Handler
// @warn    Must be the last middleware
app.use(errorHandler);

export default app;
