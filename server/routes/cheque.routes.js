import { Router } from "express";
const router = Router();

import * as controller from "../controllers/cheque.controller.js";

import { hasLevel3Access } from "../middleware/auth.middleware.js";

router.route("/")
    // @route   GET api/cheques/
    // @access  Private (Level 2)
    .get(controller.getCheques)
    // @route   POST api/cheques/
    // @access  Private (Level 3)
    .post(hasLevel3Access, controller.createCheque);

router.route("/:id")
    // @route   GET api/cheques/:id
    // @access  Private (Level 2)
    .get(controller.getCheque)

export default router;