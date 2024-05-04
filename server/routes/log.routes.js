import { Hono } from "hono";
const router = new Hono();

import * as controller from "../controllers/log.controller.js";

import { authorize } from "../middleware/auth.middleware.js";
import { ADMIN, MODERATOR } from "../utils/constants/userRoles.js";
import * as validator from "../middleware/validators/log.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  apiPrefix/logs

router.use(authorize());

router
  .route("/")
  // @access  Complex - See controller
  .get(controller.getLogs)
  // @access  Mod, Admin
  .post(
    authorize([MODERATOR, ADMIN]),
    validator.validateCreateLog,
    controller.createLog
  );

// @routes  apiPrefix/logs/:logID

router
  .route("/:logID")
  .all(validateParamID("logID"))
  // @access  Complex - See controller
  .get(controller.getLog)
  // @access  Mod, Admin
  .put(
    authorize([MODERATOR, ADMIN]),
    validator.validateUpdateLog,
    controller.updateLog
  )
  // @access  Mod, Admin
  .delete(authorize([MODERATOR, ADMIN]), controller.deleteLog);

export default router;
