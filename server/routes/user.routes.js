import { Router } from "express";
const router = Router();

import * as controller from "../controllers/user.controller.js";

import { isAuth, hasLevel2Access, hasLevel3Access, isAdmin } from "../middleware/auth.middleware.js";

import * as validator from "../middleware/validators/user.validator.js";

//  @routes  api/users

router.route("/")
    .post(isAuth, hasLevel3Access, validator.validateRegisterUser, controller.registerUser)
    .get(hasLevel2Access, controller.getUsers);

router.post("/check-username/", isAuth, hasLevel3Access, validator.validateCheckUsername, controller.checkUsername);

router.put("/change-password", isAuth, validator.validateChangePassword, controller.changePassword);

// @routes api/users/:id

router.route("/:id")
    .get(hasLevel2Access, controller.getUser)
    .put(hasLevel3Access, validator.validateUpdateUser, controller.updateUser)
    .delete(isAdmin, controller.deleteUser);

router.put("/:id/reset-password", isAdmin, validator.validateResetPassword, controller.resetPassword);

router.put("/:id/access-level", isAdmin, validator.validateSetAccessLevel, controller.setAccessLevel)

router.put("/:id/active-status", isAdmin, validator.validateSetActiveStatus, controller.setActiveStatus)

export default router;