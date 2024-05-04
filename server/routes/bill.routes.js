import { Hono } from "hono";
const router = new Hono();

import * as controller from "../controllers/bill.controller.js";

import { authorize, notAuthorized } from "../middleware/auth.middleware.js";
import { USER, ADMIN, MODERATOR } from "../utils/constants/userRoles.js";
import * as validator from "../middleware/validators/bill.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  apiPrefix/bills

router.use(notAuthorized([USER]));

router
  .route("/")
  // @access  Spec, Mod, Admin
  .get(controller.getBills)
  // @access  Mod, Admin
  .post(
    authorize([MODERATOR, ADMIN]),
    validator.validateCreateBill,
    controller.createBill
  );

// @routes  apiPrefix/bills/:billID

router
  .route("/:billID")
  .all(validateParamID("billID"))
  // @access  Spec, Mod, Admin
  .get(controller.getBill)
  // @access  Mod, Admin
  .put(authorize([MODERATOR, ADMIN]), controller.updateBill)
  // @access  Mod, Admin
  .delete(authorize([MODERATOR, ADMIN]), controller.deleteBill);

export default router;
