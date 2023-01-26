import { Router } from "express";
const router = Router();

import * as controller from "../controllers/log.controller.js";

import { hasLevel2Access, hasLevel3Access } from "../middleware/auth.middleware.js";

//  @routes  api/logs

router.route("/")
    // @access  Private (Level 2)
    .get(controller.getLogs)
    // @access  Private (Level 3)
    .post(hasLevel3Access, controller.createLog);

router.route("/:id")
    // @access  Private (Level 2)
    .get(hasLevel2Access, controller.getLog)
    // @route   PUT api/logs/:id
    // @access  Private (Level 3)
    .put(hasLevel3Access, controller.updateLog)
    // @route   DELETE api/logs/:id
    // @access  Private (Level 3)
    .delete(hasLevel3Access, controller.deleteLog);

export default router;