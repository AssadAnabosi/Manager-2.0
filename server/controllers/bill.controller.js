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

// @desc    Create a bill
export const createBill = async (req, res, next) => {
    const { date, value, description, extraNotes } = req.body;
    if (!date || !value || !description) {
        return next(new ResponseError("Please provide date, value, and description", 400));
    }
    try {
        await Bill.create({
            date, value, description, extraNotes
        });
        return res.sendStatus(201);
    } catch (error) {
        next(error);
    }
};

// @desc    Get a bill
export const getBill = async (req, res, next) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill)
            return next(new ResponseError("Bill not found", 404));
        return res.status(200).json({
            success: true,
            data: bill
        });
    } catch (error) {
        next(error);
    }
};