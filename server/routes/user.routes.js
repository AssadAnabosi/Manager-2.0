import { Router } from "express";
const router = Router();

import * as controller from "../controllers/user.controller.js";
import catchError from "../utils/catchError.js";

import {
  isAuth,
  hasLevel2Access,
  hasLevel3Access,
  isAdmin,
} from "../middleware/auth.middleware.js";
import * as validator from "../middleware/validators/user.validator.js";
import { validateParamID } from "../middleware/reqValidators.middleware.js";

//  @routes  api/users

router
  .route("/")
  .post(
    isAuth,
    hasLevel3Access,
    validator.validateRegisterUser,
    catchError(controller.registerUser)
  )
  .get(hasLevel2Access, catchError(controller.getUsers));

router.post(
  "/check-username/",
  isAuth,
  hasLevel3Access,
  validator.validateCheckUsername,
  catchError(controller.checkUsername)
);

router.put(
  "/change-password",
  isAuth,
  validator.validateChangePassword,
  catchError(controller.changePassword)
);

// @routes api/users/:userID

router
  .route("/:userID")
  .all(validateParamID("userID"))
  .get(hasLevel2Access, catchError(controller.getUser))
  .put(
    hasLevel3Access,
    validator.validateUpdateUser,
    catchError(controller.updateUser)
  )
  .delete(isAdmin, catchError(controller.deleteUser));

router.route("/:userID/*").all(validateParamID("userID"), isAdmin);

router.put(
  "/:userID/reset-password",
  validator.validateResetPassword,
  catchError(controller.resetPassword)
);

router.put(
  "/:userID/access-level",
  validator.validateSetAccessLevel,
  catchError(controller.setAccessLevel)
);

router.put(
  "/:userID/active-status",
  validator.validateSetActiveStatus,
  catchError(controller.setActiveStatus)
);

export default router;
