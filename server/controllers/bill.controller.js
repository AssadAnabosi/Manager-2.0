import Bill from '../models/Bill.model.js';
import ResponseError from "../utils/responseError.js";

// @desc    Get all bills
export const getBills = async (req, res, next) => {
    try {
        const bills = await Bill.find();
        return res.status(200).json({
            success: true,
            data: bills,
        });
    } catch (error) {
        next(error);
    }
};