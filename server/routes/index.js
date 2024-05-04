import { Hono } from "hono";
const router = new Hono();

import authRoutes from "./auth.routes.js";
import usersRoutes from "./user.routes.js";
import logsRoutes from "./log.routes.js";
import billsRoutes from "./bill.routes.js";
import payeesRoutes from "./payee.routes.js";
import chequesRoutes from "./cheque.routes.js";

// @desc    Middleware Import
import { OK, NOT_FOUND } from "../utils/constants/statusCodes.js";

router.get("/", (c) => {
  return c.json(
    {
      success: true,
      message: "What are you doing here ?",
      data: {
        version: "2.0.0",
        environment: process.env.ENV,
      },
    },
    OK
  );
});

// @desc    Health Check route, used for monitoring
router.use("/health", (c) => {
  return c.text("OK", OK);
});

// @desc    Routes
router.route("/auth", authRoutes);
router.route("/users", usersRoutes);
router.route("/logs", logsRoutes);
router.route("/bills", billsRoutes);
router.route("/payees", payeesRoutes);
router.route("/cheques", chequesRoutes);

// @desc    Undefined routes
router.route("*").all((c) => {
  return c.json(
    {
      success: false,
      message:
        "Oops, you have reached an undefined route, please check your request and try again",
    },
    NOT_FOUND
  );
});

export default router;
