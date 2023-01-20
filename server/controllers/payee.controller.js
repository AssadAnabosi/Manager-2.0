import Payee from "../models/Payee.model.js";

// @desc    Get all payees
export const getPayees = async (req, res, next) => {
    try {
        const payees = await Payee.find();
        return res.status(200).json({
            success: true,
            data: payees,
        });
    } catch (error) {
        next(error);
    }
};