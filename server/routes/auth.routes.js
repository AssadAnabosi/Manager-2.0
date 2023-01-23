import { Router } from "express";
const router = Router();

import * as controller from "../controllers/auth.controller.js";

import { isAuth, hasLevel3Access } from "../middleware/auth.middleware.js";

// @desc    Register Route
router.route("/register")
    .post(isAuth, hasLevel3Access, controller.register)
// @desc    Login Route
router.route("/login")
    .post(controller.login)
// @desc    Retrieve current authenticated user
router.route("/me")
    .get(isAuth, controller.getMe)

export default router;