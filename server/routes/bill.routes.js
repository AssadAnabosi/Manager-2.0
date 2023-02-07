import { Router } from "express";
const router = Router();

import * as controller from "../controllers/bill.controller.js";

import { hasLevel3Access } from "../middleware/auth.middleware.js";

import * as validator from "../middleware/validators/bill.validator.js";

import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  api/bills

router
  .route("/")
  // @access  Private (Level 2)
  .get(controller.getBills)
  // @access  Private (Level 3)
  .post(hasLevel3Access, validator.validateCreateBill, controller.createBill);

// @routes  api/bills/:billID

router
  .route("/:billID")
  .all(validateParamID("billID"))
  // @access  Private (Level 2)
  .get(controller.getBill)
  // @access  Private (Level 3)
  .put(hasLevel3Access, controller.updateBill)
  // @access  Private (Level 3)
  .delete(hasLevel3Access, controller.deleteBill);

export default router;
