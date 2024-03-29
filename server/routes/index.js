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
import { authorize, notAuthorized } from "../middleware/auth.middleware.js";
import { USER } from "../utils/constants/userRoles.js";
import { OK, NOT_FOUND } from "../utils/constants/statusCodes.js";

router.get("/", (req, res) => {
  return res.status(OK).json({
    success: true,
    message: "What are you doing here ?",
    data: {
      version: "2.0.0",
      environment: process.env.NODE_ENV,
    },
  });
});

// @desc    Health Check route, used for monitoring
router.use("/health", (req, res) => {
  return res.sendStatus(OK);
});

// @desc    Routes
router.use("/auth", authRoutes);
router.use("/users", authorize(), usersRoutes);
router.use("/logs", authorize(), logsRoutes);
router.use("/bills", notAuthorized([USER]), billsRoutes);
router.use("/payees", notAuthorized([USER]), payeesRoutes);
router.use("/cheques", notAuthorized([USER]), chequesRoutes);

// @desc    Undefined routes
router.route("*").all((req, res) => {
  return res.status(NOT_FOUND).json({
    success: false,
    message:
      "Oops, you have reached an undefined route, please check your request and try again",
  });
});

export default router;
