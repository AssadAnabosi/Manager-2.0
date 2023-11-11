import { Router } from "express";
const router = Router();

import * as controller from "../controllers/auth.controller.js";
import catchError from "../utils/catchError.js";

import { authorize, isAuth } from "../middleware/auth.middleware.js";
import * as validator from "../middleware/validators/auth.validator.js";
import limiter from "../middleware/limiter.middleware.js";

//  @routes  api/auth

router.post(
  "/",
  validator.validateLogin,
  limiter,
  catchError(controller.login)
);

router.get("/refresh", catchError(controller.refresh));

router.post("/logout", catchError(controller.logout));

// @desc    Retrieve current authenticated user info
router.get("/me", authorize(), catchError(controller.getMe));

export default router;
