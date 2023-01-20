import { Router } from "express";
const router = Router();

import * as controller from "../controllers/bill.controller.js";

import { hasLevel3Access } from "../middleware/auth.middleware.js";

router.route("/")
    // @route   GET api/bills/
    // @access  Private (Level 2)
    .get(controller.getBills)
    // @route   POST api/bills/
    // @access  Private (Level 3)
    .post(hasLevel3Access, controller.createBill);


export default router;