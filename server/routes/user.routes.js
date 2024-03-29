import { Router } from "express";
const router = Router();

import * as controller from "../controllers/user.controller.js";
import catchError from "../utils/catchError.js";

import { authorize } from "../middleware/auth.middleware.js";
import { ADMIN, MODERATOR, SPECTATOR } from "../utils/constants/userRoles.js";
import * as validator from "../middleware/validators/user.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  apiPrefix/users

router
  .route("/")
  .get(
    authorize([SPECTATOR, MODERATOR, ADMIN]),
    catchError(controller.getUsers)
  )
  .post(
    authorize([MODERATOR, ADMIN]),
    validator.validateRegisterUser,
    catchError(controller.registerUser)
  );

router.post(
  "/check-username/",
  authorize([MODERATOR, ADMIN]),
  validator.validateCheckUsername,
  catchError(controller.checkUsername)
);

router.patch(
  "/password",
  validator.validateUpdatePassword,
  catchError(controller.updatePassword)
);

router.patch(
  "/preferences",
  validator.validateUpdatePreferences,
  catchError(controller.updatePreferences)
);

// @routes apiPrefix/users/:userID

router
  .route("/:userID")
  .all(validateParamID("userID"))
  .get(authorize([SPECTATOR, MODERATOR, ADMIN]), catchError(controller.getUser))
  .put(
    authorize([ADMIN]),
    validator.validateUpdateUser,
    catchError(controller.updateUser)
  )
  .delete(authorize([ADMIN]), catchError(controller.deleteUser));

router.route("/:userID/*").all(validateParamID("userID"), authorize([ADMIN]));

router.patch(
  "/:userID/password",
  validator.validateResetPassword,
  catchError(controller.resetPassword)
);

router.patch(
  "/:userID/role",
  validator.validateUpdateUserRole,
  catchError(controller.updateUserRole)
);

router.patch(
  "/:userID/status",
  validator.validateSetActiveStatus,
  catchError(controller.setActiveStatus)
);

export default router;
