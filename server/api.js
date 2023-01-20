import express from "express";
const router = express.Router();

// @desc    Routes Import
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/user.routes.js";

// @desc    Middleware Import
import { isAuth } from "./middleware/auth.middleware.js";

// @desc    Routes
router.use("/auth", authRoutes);
router.use("/users", isAuth, usersRoutes);

// @desc    Undefined routes
router.route("*")
    .all((req, res) => {
        return res.status(404).json({
            success: false,
            message: "Oops, you have reached an undefined route, please check your request and try again",
        });
    });

export default router;