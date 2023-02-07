import { Router } from "express";
const router = Router();

import * as controller from "../controllers/cheque.controller.js";

import { hasLevel3Access } from "../middleware/auth.middleware.js";

import * as validator from "../middleware/validators/cheque.validator.js";

import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  api/cheques

router
  .route("/")
  // @access  Private (Level 2)
  .get(controller.getCheques)
  // @access  Private (Level 3)
  .post(
    hasLevel3Access,
    validator.validateCreateCheque,
    controller.createCheque
  );

// @routes  api/cheques/:chequeID

router
  .route("/:chequeID")
  .all(validateParamID("chequeID"))
  // @access  Private (Level 2)
  .get(controller.getCheque)
  // @access  Private (Level 3)
  .put(hasLevel3Access, validator.validateUpdateCheque, controller.updateCheque)
  // @access  Private (Level 3)
  .delete(hasLevel3Access, controller.deleteCheque);

export default router;
