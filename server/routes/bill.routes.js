import { Router } from "express";
const router = Router();

import * as controller from "../controllers/bill.controller.js";

import { hasLevel3Access } from "../middleware/auth.middleware.js";

//  @routes  api/bills

router.route("/")
    // @access  Private (Level 2)
    .get(controller.getBills)
    // @access  Private (Level 3)
    .post(hasLevel3Access, controller.createBill);

router.route("/:id")
    // @access  Private (Level 2)
    .get(controller.getBill)
    // @access  Private (Level 3)
    .put(hasLevel3Access, controller.updateBill)
    // @access  Private (Level 3)
    .delete(hasLevel3Access, controller.deleteBill);

export default router;