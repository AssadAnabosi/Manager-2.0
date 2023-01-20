import Cheque from "../models/Cheque.model.js";
import Payee from "../models/Payee.model.js";
import ResponseError from "../utils/responseError.js";

// @desc    Get all Cheques
export const getCheques = async (req, res, next) => {
    try {
        const cheques = await Cheque.find()
            .populate("payee", "name");
        return res.status(200).json({
            success: true,
            data: cheques,
        });
    } catch (error) {
        next(error);
    }
};