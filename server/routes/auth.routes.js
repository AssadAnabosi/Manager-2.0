import { Router } from "express";
const router = Router();

import * as controller from "../controllers/auth.controller.js";

import { isAuth } from "../middleware/auth.middleware.js";
import * as validator from "../middleware/validators/auth.validator.js";
import limiter from "../middleware/limiter.middleware.js";

//  @routes  api/auth

router.post("/", validator.validateLogin, limiter, controller.login);

router.get("/refresh", controller.refresh);

router.post("/logout", controller.logout);

// @desc    Retrieve current authenticated user info
router.get("/me", isAuth, controller.getMe);

export default router;