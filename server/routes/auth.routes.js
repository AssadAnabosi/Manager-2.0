import { Router } from "express";
const router = Router();

import * as controller from "../controllers/auth.controller.js";

import { isAuth, hasLevel3Access } from "../middleware/auth.middleware.js";

// @desc    Register Route
router.route("/register")
    .post(controller.register)
// @desc    Login Route
router.route("/login")
    .post(controller.login)
// @desc    Change Password Route  
router.route("/change-password")
    .post(isAuth, controller.changePassword)
// @desc    Check Username Route
router.route("/check-username/")
    .post(isAuth, hasLevel3Access, controller.checkUsername)
// @desc    Retrieve current authenticated user
router.route("/me")
    .get(isAuth, controller.getMe)

export default router;