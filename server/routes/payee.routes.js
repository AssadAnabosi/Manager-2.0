import { Hono } from "hono";
const router = new Hono();

import * as controller from "../controllers/payee.controller.js";

import { authorize, notAuthorized } from "../middleware/auth.middleware.js";
import { USER, ADMIN, MODERATOR } from "../utils/constants/userRoles.js";
import * as validator from "../middleware/validators/payee.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  apiPrefix/payees

router.use(notAuthorized([USER]));

router
  .route("/")
  // @access  Spec, Mod, Admin
  .get(controller.getPayees)
  // @access  Mod, Admin
  .post(
    authorize([MODERATOR, ADMIN]),
    validator.validateCreatePayee,
    controller.createPayee
  );

// @routes  apiPrefix/payees/:payeeID

router
  .route("/:payeeID")
  .all(validateParamID("payeeID"))
  // @access  Spec, Mod, Admin
  .get(controller.getPayee)
  // @access  Mod, Admin
  .put(authorize([MODERATOR, ADMIN]), controller.updatePayee)
  // @access  Mod, Admin
  .delete(authorize([MODERATOR, ADMIN]), controller.deletePayee);

export default router;
