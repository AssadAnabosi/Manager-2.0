import Log from "../models/Log.model.js";
import Worker from "../models/User.model.js";
import ResponseError from "../utils/responseError.js";
import ObjectID from "../utils/ObjectID.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import ReqQueryHelper from "../helpers/reqQuery.helper.js";
import * as queryHelper from "../helpers/queries/logs.queries.js";
import { USER } from "../utils/constants/userRoles.js";

// @desc    Get all logs
export const getLogs = async (req, res, next) => {
  const { startDate, endDate, search } = ReqQueryHelper(req.query);
  const filter = queryHelper.findLogs({ search, startDate, endDate });

  //  Filter logs by requested user if the user role is USER
  if (req.user.role === USER) {
    filter.unshift({ $match: { worker: ObjectID(req.user.id) } });
  }

  const logs = await Log.aggregate(filter).sort({ date: -1 });

  const _id = logs.map(({ id }) => id);

  //  Find the sum of payments
  let paymentSums = (await Log.aggregate(queryHelper.findPaymentsSum(_id)))[0];
  const paymentsSumValue = paymentSums ? paymentSums.paymentsSum : 0;

  //  Find the days count and OTV sum
  let attendanceSums = (
    await Log.aggregate(queryHelper.findAttendanceSums(_id))
  )[0];
  const daysCount = attendanceSums ? attendanceSums.daysCount : 0;
  const OTVSum = attendanceSums ? attendanceSums.OTVSum : 0;

  return res.status(statusCode.OK).json({
    success: true,
    data: {
      logs,
      paymentsSumValue,
      daysCount,
      OTVSum,
      startDate: startDate.toISOString().substring(0, 10),
      endDate: endDate.toISOString().substring(0, 10),
      search,
    },
  });
};

// @desc    Create a log
export const createLog = async (req, res, next) => {
  let { date, isAbsent, startingTime, finishingTime, payment, extraNotes } =
    req.body;
  date = new Date(date);
  date.setUTCHours(0, 0, 0, 0);
  if (
    (isAbsent === undefined || isAbsent === null) &&
    (!startingTime || !finishingTime)
  ) {
    return next(
      new ResponseError(
        "Please provide a starting time and finishing time",
        statusCode.BAD_REQUEST
      )
    );
  }

  const worker = await Worker.findById(req.body.worker);
  if (!worker)
    return next(new ResponseError("Worker not found", statusCode.NOT_FOUND));

  const log = new Log({
    worker: req.body.worker,
    date,
    isAbsent,
    startingTime,
    finishingTime,
    payment,
    extraNotes,
  });
  await log.save();

  return res.sendStatus(statusCode.CREATED);
};

// @desc    Get a log
export const getLog = async (req, res, next) => {
  const log = await Log.aggregate(queryHelper.findLogByID(req.params.logID));
  if (req.user.role === USER && log.worker.id !== req.user.id) {
    return next(
      new ResponseError(
        "You are not authorized to access this log",
        statusCode.NOT_AUTHORIZED
      )
    );
  }
  if (!log || log.length === 0)
    return next(new ResponseError("Log not found", statusCode.NOT_FOUND));

  return res.status(statusCode.OK).json({
    success: true,
    data: log,
  });
};

// @desc    Update a log
export const updateLog = async (req, res, next) => {
  const { isAbsent, startingTime, finishingTime } = req.body;

  if (
    (isAbsent === undefined || isAbsent === null) &&
    (!startingTime || !finishingTime)
  ) {
    return next(
      new ResponseError(
        "Please provide a starting time and finishing time",
        statusCode.BAD_REQUEST
      )
    );
  }
  if (req.body.date) {
    req.body.date = new Date(req.body.date);
    req.body.date.setUTCHours(0, 0, 0, 0);
  }
  const log = await Log.findByIdAndUpdate(req.params.logID, req.body, {
    new: true,
    runValidators: true,
  });
  if (!log)
    return next(new ResponseError("Log not found", statusCode.NOT_FOUND));

  return res.sendStatus(statusCode.NO_CONTENT);
};

// @desc    Delete a log
export const deleteLog = async (req, res, next) => {
  const log = await Log.findByIdAndDelete(req.params.logID);
  if (!log)
    return next(new ResponseError("Log not found", statusCode.NOT_FOUND));

  return res.sendStatus(statusCode.NO_CONTENT);
};
