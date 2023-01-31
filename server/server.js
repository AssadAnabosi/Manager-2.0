import dotenv from "dotenv";
dotenv.config({
    path: "./config/config.env"
});

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB, { createAdmin } from "./config/db.config.js";
import APIRoutes from "./routes/index.js";
import errorHandler from "./middleware/error.middleware.js";
import credentials from "./middleware/allowCredentials.middleware.js";
import corsOptions from "./config/cors.config.js";

// @desc    Connect to DB
connectDB();
createAdmin();

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

// @desc    Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server has started on PORT: ${PORT}`);
})

process.on("unhandledRejection", (err, promise) => {
    console.log(`Logged Error: \n${err}`);
    server.close(() => process.exit(1));
});