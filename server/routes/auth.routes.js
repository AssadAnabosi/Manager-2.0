import { Router } from "express";
const router = Router();

import * as controller from "../controllers/auth.controller.js";

// @desc    Register Route
router.route("/register")
    .post(controller.register)

export default router;