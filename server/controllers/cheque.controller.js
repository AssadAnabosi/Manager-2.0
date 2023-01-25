import Cheque from "../models/Cheque.model.js";
import Payee from "../models/Payee.model.js";
import ResponseError from "../utils/responseError.js";
import ReqQueryHelper from "../utils/ReqQueryHelper.js";
import * as queryHelper from "../utils/queryHelper.js";

// @desc    Get all Cheques
export const getCheques = async (req, res, next) => {
    const { startDate, endDate, search } = ReqQueryHelper(req.query);
    try {
        const cheques = await Cheque
            .aggregate(queryHelper.chequesQuery(search, startDate, endDate))
            .sort({ dueDate: 1, serial: 1 });
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

// @desc    Get a Cheque
export const getCheque = async (req, res, next) => {
    try {
        const cheque = await Cheque.findById(req.params.id)
            .populate("payee", "name");
        if (!cheque)
            return next(new ResponseError("Cheque not found", 404));
        return res.status(200).json({
            success: true,
            data: cheque,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a Cheque
export const updateCheque = async (req, res, next) => {
    if (req.body.serial)
        return next(new ResponseError("You can't change the Serial Number", 400));
    try {
        const cheque = await Cheque.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!cheque)
            return next(new ResponseError("Cheque not found", 404));
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a Cheque
export const deleteCheque = async (req, res, next) => {
    try {
        const cheque = await Cheque.findByIdAndDelete(req.params.id);
        if (!cheque)
            return next(new ResponseError("Cheque not found", 404));
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};