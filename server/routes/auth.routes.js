import { Hono } from "hono";
const router = new Hono();

import * as controller from "../controllers/auth.controller.js";

import { authorize } from "../middleware/auth.middleware.js";
import * as validator from "../middleware/validators/auth.validator.js";
import limiter from "../middleware/limiter.middleware.js";

//  @routes  apiPrefix/auth

// @desc    Retrieve current authenticated user info
router.get("/", authorize(), controller.getMe);

router.post("/", validator.validateLogin, limiter, controller.login);

router.post("/refresh", controller.refresh);

router.delete("/logout", controller.logout);

export default router;
