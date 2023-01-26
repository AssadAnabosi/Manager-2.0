import { Router } from "express";
const router = Router();

import * as controller from "../controllers/cheque.controller.js";

import { hasLevel3Access } from "../middleware/auth.middleware.js";

//  @routes  api/cheques

router.route("/")
    // @access  Private (Authenticated || Level 2)
    .get(controller.getCheques)
    // @access  Private (Level 3)
    .post(hasLevel3Access, controller.createCheque);

router.route("/:id")
    // @access  Private (Level 2)
    .get(controller.getCheque)
    // @access  Private (Level 3)
    .put(hasLevel3Access, controller.updateCheque)
    // @access  Private (Level 3)
    .delete(hasLevel3Access, controller.deleteCheque);

export default router;