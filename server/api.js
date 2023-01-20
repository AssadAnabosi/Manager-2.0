import express from "express";
const router = express.Router();

// @desc    Routes Import
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/user.routes.js";
import logsRoutes from "./routes/log.routes.js";
import billsRoutes from "./routes/bill.routes.js";
import payeesRoutes from "./routes/payee.routes.js";

// @desc    Middleware Import
import { hasLevel2Access, isAuth } from "./middleware/auth.middleware.js";

// @desc    Routes
router.use("/auth", authRoutes);
router.use("/users", isAuth, usersRoutes);
router.use("/logs", isAuth, hasLevel2Access, logsRoutes);
router.use("/bills", isAuth, hasLevel2Access, billsRoutes);
router.use("/payees", isAuth, hasLevel2Access, payeesRoutes);

// @desc    Undefined routes
router.route("*")
    .all((req, res) => {
        return res.status(404).json({
            success: false,
            message: "Oops, you have reached an undefined route, please check your request and try again",
        });
    });

export default router;