import { Router } from "express";
const router = Router();

import * as controller from "../controllers/payee.controller.js";

import { hasLevel3Access } from "../middleware/auth.middleware.js";

// @desc    Routes
router.route("/")
    // @route   GET api/payees/
    // @access  Private (Level 2)
    .get(controller.getPayees)
    // @route   POST api/payees/
    // @access  Private (Level 3)
    .post(hasLevel3Access, controller.createPayee);

export default router;