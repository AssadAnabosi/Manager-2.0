import { Router } from "express";
const router = Router();

import * as controller from "../controllers/auth.controller.js";

// @desc    Register Route
router.route("/register")
    .post(controller.register)
// @desc    Login Route
router.route("/login")
    .post(controller.login)

export default router;