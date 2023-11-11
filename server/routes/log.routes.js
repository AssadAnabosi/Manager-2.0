import { Router } from "express";
const router = Router();

import * as controller from "../controllers/log.controller.js";
import catchError from "../utils/catchError.js";

import { authorize } from "../middleware/auth.middleware.js";
import { ADMIN, MODERATOR } from "../utils/constants/userRoles.js";
import * as validator from "../middleware/validators/log.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  api/logs

router
  .route("/")
  // @access  Complex - See controller
  .get(catchError(controller.getLogs))
  // @access  Mod, Admin
  .post(
    authorize([MODERATOR, ADMIN]),
    validator.validateCreateLog,
    catchError(controller.createLog)
  );

// @routes  api/logs/:logID

router
  .route("/:logID")
  .all(validateParamID("logID"))
  // @access  Complex - See controller
  .get(catchError(controller.getLog))
  // @access  Mod, Admin
  .put(
    authorize([MODERATOR, ADMIN]),
    validator.validateUpdateLog,
    catchError(controller.updateLog)
  )
  // @access  Mod, Admin
  .delete(authorize([MODERATOR, ADMIN]), catchError(controller.deleteLog));

export default router;
