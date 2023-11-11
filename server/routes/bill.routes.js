import { Router } from "express";
const router = Router();

import * as controller from "../controllers/bill.controller.js";
import catchError from "../utils/catchError.js";

import { authorize } from "../middleware/auth.middleware.js";
import { ADMIN, MODERATOR } from "../utils/constants/userRoles.js";
import * as validator from "../middleware/validators/bill.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  api/bills

router
  .route("/")
  // @access  Spec, Mod, Admin
  .get(catchError(controller.getBills))
  // @access  Mod, Admin
  .post(
    authorize([MODERATOR, ADMIN]),
    validator.validateCreateBill,
    catchError(controller.createBill)
  );

// @routes  api/bills/:billID

router
  .route("/:billID")
  .all(validateParamID("billID"))
  // @access  Spec, Mod, Admin
  .get(catchError(controller.getBill))
  // @access  Mod, Admin
  .put(authorize([MODERATOR, ADMIN]), catchError(controller.updateBill))
  // @access  Mod, Admin
  .delete(authorize([MODERATOR, ADMIN]), catchError(controller.deleteBill));

export default router;
