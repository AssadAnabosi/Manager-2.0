import { Router } from "express";
const router = Router();

import * as controller from "../controllers/log.controller.js";
import catchError from "../utils/catchError.js";

import {
  hasLevel2Access,
  hasLevel3Access,
} from "../middleware/auth.middleware.js";
import * as validator from "../middleware/validators/log.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  api/logs

router
  .route("/")
  // @access  Complex (Level 1 or 2) - See controller
  .get(catchError(controller.getLogs))
  // @access  Private (Level 3)
  .post(
    hasLevel3Access,
    validator.validateCreateLog,
    catchError(controller.createLog)
  );

// @routes  api/logs/:logID

router
  .route("/:logID")
  .all(validateParamID("logID"))
  // @access  Private (Level 2)
  .get(hasLevel2Access, catchError(controller.getLog))
  // @access  Private (Level 3)
  .put(
    hasLevel3Access,
    validator.validateUpdateLog,
    catchError(controller.updateLog)
  )
  // @access  Private (Level 3)
  .delete(hasLevel3Access, catchError(controller.deleteLog));

export default router;
