import { Router } from "express";
const router = Router();

import * as controller from "../controllers/auth.controller.js";
import catchError from "../utils/catchError.js";

import { authorize, isAuth } from "../middleware/auth.middleware.js";
import * as validator from "../middleware/validators/auth.validator.js";
import limiter from "../middleware/limiter.middleware.js";

//  @routes  apiPrefix/auth

// @desc    Retrieve current authenticated user info
router.get("/", authorize(), catchError(controller.getMe));

router.post(
  "/",
  validator.validateLogin,
  limiter,
  catchError(controller.login)
);

router.post("/refresh", catchError(controller.refresh));

router.delete("/logout", catchError(controller.logout));

export default router;
