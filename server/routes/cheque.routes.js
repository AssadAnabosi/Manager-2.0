import { Hono } from "hono";
const router = new Hono();

import * as controller from "../controllers/cheque.controller.js";

import { authorize, notAuthorized } from "../middleware/auth.middleware.js";
import { USER, ADMIN, MODERATOR } from "../utils/constants/userRoles.js";
import * as validator from "../middleware/validators/cheque.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  apiPrefix/cheques

router.use(notAuthorized([USER]));

router
  .route("/")
  // @access  Spec, Mod, Admin
  .get(controller.getCheques)
  // @access  Mod, Admin
  .post(
    authorize([MODERATOR, ADMIN]),
    validator.validateCreateCheque,
    controller.createCheque
  );

// @routes  apiPrefix/cheques/:chequeID

router
  .route("/:chequeID")
  .all(validateParamID("chequeID"))
  // @access  Spec, Mod, Admin
  .get(controller.getCheque)
  // @access  Mod, Admin
  .put(authorize([MODERATOR, ADMIN]), controller.updateCheque)
  // @access  Mod, Admin
  .delete(authorize([MODERATOR, ADMIN]), controller.deleteCheque);

export default router;
