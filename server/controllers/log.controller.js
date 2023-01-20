import Log from "../models/Log.model.js";
import Worker from "../models/User.model.js";
import ResponseError from '../utils/ResponseError.js';

// @desc    Get all logs
export const getLogs = async (req, res, next) => {
    try {
        const logs = await Log.find();
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