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

// @desc    Create a Cheque
export const createCheque = async (req, res, next) => {
    const { serial, dueDate, value, description, isCancelled } = req.body;
    if (!serial || !dueDate || !value) {
        return next(new ResponseError("Please provide a serial, due date and value", 400));
    }
    try {
        const payee = await Payee.findById(req.body.payee);
        if (!payee)
            return next(new ResponseError("Payee not found", 404));
        const cheque = new Cheque({
            serial, dueDate, value, description, payee, isCancelled
        });
        await cheque.save();
        return res.sendStatus(201);
    } catch (error) {
        next(error);
    }
};