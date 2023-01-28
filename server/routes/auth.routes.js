import { Router } from "express";
const router = Router();

import * as controller from "../controllers/auth.controller.js";

import { isAuth, hasLevel3Access } from "../middleware/auth.middleware.js";
import limiter from "../middleware/limiter.middleware.js";

//  @routes  api/auth

router.post("/", limiter, controller.login);

router.get("/refresh", controller.refresh);

router.post("/logout", controller.logout);

// @desc    Retrieve current authenticated user info
router.get("/me", isAuth, controller.getMe);

export default router;