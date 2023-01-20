import { Router } from "express";
const router = Router();

import * as controller from "../controllers/log.controller.js";

router.route("/")
    // @route   GET api/logs/
    // @access  Private (Level 2)
    .get(controller.getLogs)

export default router;