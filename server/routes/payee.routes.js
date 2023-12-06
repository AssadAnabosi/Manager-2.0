import { Router } from "express";
const router = Router();

import * as controller from "../controllers/payee.controller.js";
import catchError from "../utils/catchError.js";

import { authorize } from "../middleware/auth.middleware.js";
import { ADMIN, MODERATOR } from "../utils/constants/userRoles.js";
import * as validator from "../middleware/validators/payee.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  apiPrefix/payees

router
  .route("/")
  // @access  Spec, Mod, Admin
  .get(catchError(controller.getPayees))
  // @access  Mod, Admin
  .post(
    authorize([MODERATOR, ADMIN]),
    validator.validateCreatePayee,
    catchError(controller.createPayee)
  );

// @routes  apiPrefix/payees/:payeeID

router
  .route("/:payeeID")
  .all(validateParamID("payeeID"))
  // @access  Spec, Mod, Admin
  .get(catchError(controller.getPayee))
  // @access  Mod, Admin
  .put(authorize([MODERATOR, ADMIN]), catchError(controller.updatePayee))
  // @access  Mod, Admin
  .delete(authorize([MODERATOR, ADMIN]), catchError(controller.deletePayee));

export default router;
