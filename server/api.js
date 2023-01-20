import express from "express";
const router = express.Router();

// @desc: Undefined routes
router.route("*")
    .all((req, res) => {
        return res.status(404).json({
            success: false,
            message: "Oops, you have reached an undefined route, please check your request and try again",
        });
    });

export default router;