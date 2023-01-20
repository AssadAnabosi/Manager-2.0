import { Router } from "express";
const router = Router();

import * as controller from "../controllers/log.controller.js";

import { hasLevel3Access } from "../middleware/auth.middleware.js";

router.route("/")
    // @route   GET api/logs/
    // @access  Private (Level 2)
    .get(controller.getLogs)
    // @route   POST api/logs/
    // @access  Private (Level 3)
    .post(hasLevel3Access, controller.createLog);

router.route("/:id")
    // @route   GET api/logs/:id
    // @access  Private (Level 2)
    .get(controller.getLog)

export default router;