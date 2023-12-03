import Log from "../models/Log.model.js";
import Worker from "../models/User.model.js";
import ResponseError from "../utils/responseError.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import ReqQueryHelper from "../helpers/reqQuery.helper.js";
import * as queryHelper from "../helpers/queries/logs.queries.js";
import { USER } from "../utils/constants/userRoles.js";

// @desc    Get all logs
export const getLogs = async (req, res) => {
  const { startDate, endDate, filter: worker } = ReqQueryHelper(req.query);
  const filter = queryHelper.findLogs({
    userRole: req.user.role,
    startDate,
    endDate,
    worker,
  });

  const logs = await Log.aggregate(filter);

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
  const from = startDate ? startDate.toISOString().substring(0, 10) : "";
  const to = endDate ? endDate.toISOString().substring(0, 10) : "";
  return res.status(statusCode.OK).json({
    success: true,
    data: {
      logs,
      paymentsSumValue,
      daysCount,
      OTVSum,
      from,
      to,
      filter: worker || "",
    },
  });
};

// @desc    Create a log
export const createLog = async (req, res) => {
  let { date, isAbsent, startingTime, finishingTime, payment, remarks } =
    req.body;
  date = new Date(date);
  date.setUTCHours(0, 0, 0, 0);
  if (
    (isAbsent === undefined || isAbsent === null) &&
    (!startingTime || !finishingTime)
  ) {
    throw new ResponseError(
      "Please provide a starting time and finishing time",
      statusCode.BAD_REQUEST
    );
  }

  const worker = await Worker.findById(req.body.worker);
  if (!worker)
    throw new ResponseError("Worker not found", statusCode.NOT_FOUND);

  const log = new Log({
    worker: req.body.worker,
    date,
    isAbsent,
    startingTime,
    finishingTime,
    payment,
    remarks,
  });
  await log.save();

  return res.sendStatus(statusCode.CREATED);
};

// @desc    Get a log
export const getLog = async (req, res) => {
  const log = await Log.aggregate(queryHelper.findLogByID(req.params.logID));
  if (req.user.role === USER && log.worker.id !== req.user.id) {
    throw new ResponseError(
      "You are not authorized to access this log",
      statusCode.NOT_AUTHORIZED
    );
  }

  return res.status(statusCode.OK).json({
    success: true,
    data: {
      log: log[0],
    },
  });
};

// @desc    Update a log
export const updateLog = async (req, res) => {
  const { isAbsent, startingTime, finishingTime } = req.body;

  if (
    (isAbsent === undefined || isAbsent === null) &&
    (!startingTime || !finishingTime)
  ) {
    throw new ResponseError(
      "Please provide a starting time and finishing time",
      statusCode.BAD_REQUEST
    );
  }
  if (req.body.date) {
    req.body.date = new Date(req.body.date);
    req.body.date.setUTCHours(0, 0, 0, 0);
  }
  await Log.findByIdAndUpdate(req.params.logID, req.body, {
    new: true,
    runValidators: true,
  });

  return res.sendStatus(statusCode.NO_CONTENT);
};

// @desc    Delete a log
export const deleteLog = async (req, res) => {
  await Log.findByIdAndDelete(req.params.logID);

  return res.sendStatus(statusCode.NO_CONTENT);
};
