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