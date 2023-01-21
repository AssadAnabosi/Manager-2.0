import Log from "../models/Log.model.js";
import Worker from "../models/User.model.js";
import ResponseError from '../utils/ResponseError.js';

// @desc    Get all logs
export const getLogs = async (req, res, next) => {
    try {
        const logs = await Log.find().populate("worker", "firstName lastName");
        return res.status(200).json({
            success: true,
            data: logs,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a log
export const createLog = async (req, res, next) => {
    try {
        const { date, isAbsence, startingTime, finishingTime, payment, extraNotes } = req.body;
        // @desc Log validation
        if (!date || !req.body.worker)
            return next(new ResponseError("Please provide a date and workerId", 400));

        const worker = await Worker.findById(req.body.worker);
        if (!worker)
            return next(new ResponseError("Worker not found", 404));
        const log = new Log({
            worker: req.body.worker, date, isAbsence, startingTime, finishingTime, payment, extraNotes
        });
        await log.save();
        return res.sendStatus(201);
    } catch (error) {
        next(error);
    }
};

// @desc    Get a log
export const getLog = async (req, res, next) => {
    try {
        const log = await Log.findById(req.params.id).populate("worker", "firstName lastName");
        if (!log)
            return next(new ResponseError("Log not found", 404));
        return res.status(200).json({
            success: true,
            data: log
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    Update a log
export const updateLog = async (req, res, next) => {
    if (req.body.worker || req.body.date) {
        return next(new ResponseError("You can't change the date or worker", 400));
    }
    try {
        const log = await Log.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!log)
            return next(new ResponseError("Log not found", 404));
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a log
export const deleteLog = async (req, res, next) => {
    try {
        const log = await Log.findByIdAndDelete(req.params.id);
        if (!log)
            return next(new ResponseError("Log not found", 404));
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};