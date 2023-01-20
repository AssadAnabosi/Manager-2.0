import { Router } from "express";
const router = Router();

import * as controller from "../controllers/bill.controller.js";

router.route("/")
    // @route   GET api/bills/
    // @access  Private (Level 2)
    .get(controller.getBills)

export default router;