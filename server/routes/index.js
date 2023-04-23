import express from "express";
const router = express.Router();

// @desc    Routes Import
import authRoutes from "./auth.routes.js";
import usersRoutes from "./user.routes.js";
import logsRoutes from "./log.routes.js";
import billsRoutes from "./bill.routes.js";
import payeesRoutes from "./payee.routes.js";
import chequesRoutes from "./cheque.routes.js";

// @desc    Middleware Import
import { hasLevel2Access, isAuth } from "../middleware/auth.middleware.js";
import { OK, NOT_FOUND } from "../utils/constants/statusCodes.js";

// @desc    Health Check route, used for monitoring
router.use("/health", (req, res) => {
  return res.sendStatus(OK);
});

// @desc    Routes
router.use("/auth", authRoutes);
router.use("/users", isAuth, usersRoutes);
router.use("/logs", isAuth, logsRoutes);
router.use("/bills", isAuth, hasLevel2Access, billsRoutes);
router.use("/payees", isAuth, hasLevel2Access, payeesRoutes);
router.use("/cheques", isAuth, hasLevel2Access, chequesRoutes);

// @desc    Undefined routes
router.route("*").all((req, res) => {
  return res.status(NOT_FOUND).json({
    success: false,
    message:
      "Oops, you have reached an undefined route, please check your request and try again",
  });
});

export default router;
