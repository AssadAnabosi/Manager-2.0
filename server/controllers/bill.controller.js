import Bill from '../models/Bill.model.js';
import ResponseError from "../utils/responseError.js";
import ReqQueryHelper from "../utils/ReqQueryHelper.js";
import * as queryHelper from "../utils/queryHelper.js";

// @desc    Get all bills
export const getBills = async (req, res, next) => {
    const { startDate, endDate, search } = ReqQueryHelper(req.query);
    try {
        const bills = await Bill
            .aggregate(queryHelper.billsQuery(startDate, endDate, search))
            .sort({ date: -1 });

        const _id = bills.map(({ _id }) => _id)

        const allTimeTotal = await Bill.aggregate(queryHelper.billsValueSum());
        if (allTimeTotal.length < 1)
            allTimeTotal = [{ total: 0 }];

        const rangeTotal = await Bill.aggregate(queryHelper.billsValueSum(_id));
        if (rangeTotal.length < 1)
            rangeTotal = [{ total: 0 }];

        return res.status(200).json({
            success: true,
            data: {
                bills,
                allTimeTotal: allTimeTotal[0].total,
                rangeTotal: rangeTotal[0].total
            }
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
        const bill = await Bill.findById(req.params.id).select("-__v");
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

// @desc    Update a bill
export const updateBill = async (req, res, next) => {
    try {
        const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!bill)
            return next(new ResponseError("Bill not found", 404));

        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a bill
export const deleteBill = async (req, res, next) => {
    try {
        const bill = await Bill.findByIdAndDelete(req.params.id);
        if (!bill)
            return next(new ResponseError("Bill not found", 404));

        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}