import { Router } from "express";
const router = Router();

import * as controller from "../controllers/cheque.controller.js";
import catchError from "../utils/catchError.js";

import { hasLevel3Access } from "../middleware/auth.middleware.js";
import * as validator from "../middleware/validators/cheque.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  api/cheques

router
  .route("/")
  // @access  Private (Level 2)
  .get(catchError(controller.getCheques))
  // @access  Private (Level 3)
  .post(
    hasLevel3Access,
    validator.validateCreateCheque,
    catchError(controller.createCheque)
  );

// @routes  api/cheques/:chequeID

router
  .route("/:chequeID")
  .all(validateParamID("chequeID"))
  // @access  Private (Level 2)
  .get(catchError(controller.getCheque))
  // @access  Private (Level 3)
  .put(
    hasLevel3Access,
    validator.validateUpdateCheque,
    catchError(controller.updateCheque)
  )
  // @access  Private (Level 3)
  .delete(hasLevel3Access, catchError(controller.deleteCheque));

export default router;
