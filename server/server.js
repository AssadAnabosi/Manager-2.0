import dotenv from "dotenv";
dotenv.config({
    path: "./config.env"
});

import express from "express";

import connectDB from "./config/db.config.js";
import APIRoutes from "./api.js";

// @desc    Connect to DB
connectDB();

const app = express();
app.use(express.json());


// @desc    Health Check route
app.use("/healthcheck", (req, res) => {
    return res.sendStatus(200);
});

// desc: Serving API routes
app.use("/api", APIRoutes);

// @desc    Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server has started on PORT: ${PORT}`);
})

process.on("unhandledRejection", (err, promise) => {
    console.log(`Logged Error: \n${err}`);
    server.close(() => process.exit(1));
});