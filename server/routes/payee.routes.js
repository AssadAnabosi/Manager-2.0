import { Router } from "express";
const router = Router();

import * as controller from "../controllers/payee.controller.js";

// @desc    Routes
router.route("/")
    // @route   GET api/payees/
    // @access  Private (Level 2)
    .get(controller.getPayees)

export default router;