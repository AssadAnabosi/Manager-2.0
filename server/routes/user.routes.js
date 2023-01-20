import { Router } from "express";
const router = Router();

import * as controller from "../controllers/user.controller.js";

import { hasLevel2Access } from "../middleware/auth.middleware.js";

// @route   GET api/users/
// @desc    Get all users
// @access  Private (Level 2)
router.route("/")
    .get(hasLevel2Access, controller.getUsers);

export default router;