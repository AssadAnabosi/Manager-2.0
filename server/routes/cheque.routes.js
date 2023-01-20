import { Router } from "express";
const router = Router();

import * as controller from "../controllers/cheque.controller.js";

router.route("/")
    // @route   GET api/cheques/
    // @access  Private (Level 2)
    .get(controller.getCheques)

export default router;