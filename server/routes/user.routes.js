import { Hono } from "hono";
const router = new Hono();

import * as controller from "../controllers/user.controller.js";

import { authorize } from "../middleware/auth.middleware.js";
import { ADMIN, MODERATOR, SPECTATOR } from "../utils/constants/userRoles.js";
import * as validator from "../middleware/validators/user.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  apiPrefix/users

router.use(authorize());

router
  .route("/")
  .get(authorize([SPECTATOR, MODERATOR, ADMIN]), controller.getUsers)
  .post(
    authorize([MODERATOR, ADMIN]),
    validator.validateRegisterUser,
    controller.registerUser
  );

router.post(
  "/check-username",
  authorize([MODERATOR, ADMIN]),
  validator.validateCheckUsername,
  controller.checkUsername
);

router.patch(
  "/password",
  validator.validateUpdatePassword,
  controller.updatePassword
);

router.patch(
  "/preferences",
  validator.validateUpdatePreferences,
  controller.updatePreferences
);

// @routes apiPrefix/users/:userID

router
  .route("/:userID")
  .all(validateParamID("userID"))
  .get(authorize([SPECTATOR, MODERATOR, ADMIN]), controller.getUser)
  .put(authorize([ADMIN]), validator.validateUpdateUser, controller.updateUser)
  .delete(authorize([ADMIN]), controller.deleteUser);

router.route("/:userID/*").all(validateParamID("userID"), authorize([ADMIN]));

router.patch(
  "/:userID/password",
  validator.validateResetPassword,
  controller.resetPassword
);

router.patch(
  "/:userID/role",
  validator.validateUpdateUserRole,
  controller.updateUserRole
);

router.patch(
  "/:userID/status",
  validator.validateSetActiveStatus,
  controller.setActiveStatus
);

export default router;
