import { Router } from "express";
const router = Router();

import * as controller from "../controllers/user.controller.js";

import { isAuth, hasLevel2Access, hasLevel3Access, isAdmin } from "../middleware/auth.middleware.js";

//  @routes  api/users

router.route("/")
    .get(hasLevel2Access, controller.getUsers);

router.route("/:id")
    .get(hasLevel2Access, controller.getUser)
    .put(hasLevel3Access, controller.updateUser)
    .delete(hasLevel3Access, controller.deleteUser);

router.post("/check-username/", isAuth, hasLevel3Access, controller.checkUsername);

router.put("/change-password", isAuth, controller.changePassword);

router.put("/:id/reset-password", isAdmin, controller.resetPassword);

router.put("/:id/access-level", isAdmin, controller.setAccessLevel)

router.put("/:id/active-status", isAdmin, controller.setActiveStatus)

export default router;