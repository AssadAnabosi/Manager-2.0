import { Router } from "express";
const router = Router();

import * as controller from "../controllers/cheque.controller.js";
import catchError from "../utils/catchError.js";

import { authorize } from "../middleware/auth.middleware.js";
import { ADMIN, MODERATOR } from "../utils/constants/userRoles.js";
import * as validator from "../middleware/validators/cheque.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  api/cheques

router
  .route("/")
  // @access  Spec, Mod, Admin
  .get(catchError(controller.getCheques))
  // @access  Mod, Admin
  .post(
    authorize([MODERATOR, ADMIN]),
    validator.validateCreateCheque,
    catchError(controller.createCheque)
  );

// @routes  api/cheques/:chequeID

router
  .route("/:chequeID")
  .all(validateParamID("chequeID"))
  // @access  Spec, Mod, Admin
  .get(catchError(controller.getCheque))
  // @access  Mod, Admin
  .put(
    authorize([MODERATOR, ADMIN]),
    validator.validateUpdateCheque,
    catchError(controller.updateCheque)
  )
  // @access  Mod, Admin
  .delete(authorize([MODERATOR, ADMIN]), catchError(controller.deleteCheque));

export default router;
