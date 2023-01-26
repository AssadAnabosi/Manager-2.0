import { Router } from "express";
const router = Router();

import * as controller from "../controllers/auth.controller.js";

import { isAuth, hasLevel3Access } from "../middleware/auth.middleware.js";

//  @routes  api/auth

router.post("/register", isAuth, hasLevel3Access, controller.register);

router.post("/login", controller.login);

// @desc    Retrieve current authenticated user info
router.get("/me", isAuth, controller.getMe);

export default router;