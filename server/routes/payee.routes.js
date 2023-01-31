import { Router } from "express";
const router = Router();

import * as controller from "../controllers/payee.controller.js";

import { hasLevel3Access } from "../middleware/auth.middleware.js";

import * as validator from "../middleware/validators/payee.validator.js";

//  @routes  api/payees

router.route("/")
    // @access  Private (Level 2)
    .get(controller.getPayees)
    // @access  Private (Level 3)
    .post(hasLevel3Access, validator.validateCreatePayee, controller.createPayee);

// @routes  api/payees/:id

router.route("/:id")
    // @access  Private (Level 2)
    .get(controller.getPayee)
    // @access  Private (Level 3)
    .put(hasLevel3Access, validator.validateUpdatePayee, controller.updatePayee)
    // @access  Private (Level 3)
    .delete(hasLevel3Access, controller.deletePayee);

export default router;