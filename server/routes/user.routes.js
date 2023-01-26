import { Router } from "express";
const router = Router();

import * as controller from "../controllers/user.controller.js";

import { isAuth, hasLevel2Access, hasLevel3Access, isAdmin } from "../middleware/auth.middleware.js";

// @route   GET api/users/
// @desc    Get all users
// @access  Private (Level 2)
router.route("/")
    .get(hasLevel2Access, controller.getUsers);

router.route("/:id")
    // @route   GET api/users/:id
    // @access  Private (Level 2)
    .get(hasLevel2Access, controller.getUser)
    // @route   PUT api/users/:id
    // @access  Private (Level 3)
    .put(hasLevel3Access, controller.updateUser)
    // @route   DELETE api/users/:id
    // @access  Private (Level 3)
    .delete(hasLevel3Access, controller.deleteUser);

router.route("/check-username/")
    //  @route POST api/users/check-username
    //  @access Private (Level 3)
    .post(isAuth, hasLevel3Access, controller.checkUsername)


router.route("/change-password")
    //  @route PUT api/users/change-password
    //  @access Private (Auth)
    .put(isAuth, controller.changePassword)

router.route("/:id/reset-password")
    // @route   PUT api/users/:id/reset-password
    // @access  Private (Admin)
    .put(isAdmin, controller.resetPassword);

router.route("/:id/access-level")
    // @route   PUT api/users/:id/update-access-level
    // @access  Private (Admin)
    .put(isAdmin, controller.updateAccessLevel);

router.route("/:id/active-status")
    // @route   PUT api/users/:id/activation
    // @access  Private (Admin)
    .put(isAdmin, controller.setActiveStatus);

export default router;