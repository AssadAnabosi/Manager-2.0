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

router.route("/:id")
    // @route   GET api/bills/:id
    // @access  Private (Level 2)
    .get(controller.getBill)
    // @route   PUT api/bills/:id
    // @access  Private (Level 3)
    .put(hasLevel3Access, controller.updateBill)
    // @route   DELETE api/bills/:id
    // @access  Private (Level 3)
    .delete(hasLevel3Access, controller.deleteBill);

export default router;