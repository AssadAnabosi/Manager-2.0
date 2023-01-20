import { Router } from "express";
const router = Router();

import * as controller from "../controllers/auth.controller.js";

import { isAuth } from "../middleware/auth.middleware.js";

// @desc    Register Route
router.route("/register")
    .post(controller.register)
// @desc    Login Route
router.route("/login")
    .post(controller.login)
// @desc    Change Password Route  
router.route("/change-password")
    .post(isAuth, controller.changePassword)

export default router;