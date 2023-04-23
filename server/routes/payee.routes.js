import { Router } from "express";
const router = Router();

import * as controller from "../controllers/payee.controller.js";
import catchError from "../utils/catchError.js";

import { hasLevel3Access } from "../middleware/auth.middleware.js";
import * as validator from "../middleware/validators/payee.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  api/payees

router
  .route("/")
  // @access  Private (Level 2)
  .get(catchError(controller.getPayees))
  // @access  Private (Level 3)
  .post(
    hasLevel3Access,
    validator.validateCreatePayee,
    catchError(controller.createPayee)
  );

// @routes  api/payees/:payeeID

router
  .route("/:payeeID")
  .all(validateParamID("payeeID"))
  // @access  Private (Level 2)
  .get(catchError(controller.getPayee))
  // @access  Private (Level 3)
  .put(
    hasLevel3Access,
    validator.validateUpdatePayee,
    catchError(controller.updatePayee)
  )
  // @access  Private (Level 3)
  .delete(hasLevel3Access, catchError(controller.deletePayee));

export default router;
