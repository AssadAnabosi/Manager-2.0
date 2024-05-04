import Log from "../models/Log.model.js";
import Worker from "../models/User.model.js";
import ResponseError from "../utils/responseError.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import ReqQueryHelper from "../helpers/reqQuery.helper.js";
import * as queryHelper from "../helpers/queries/logs.queries.js";
import { USER } from "../utils/constants/userRoles.js";

// @desc    Get all logs
export const getLogs = async (c) => {
  const { startDate, endDate, filter: workers } = ReqQueryHelper(c.req.query());
  const filter = queryHelper.findLogs({
    userRole: c.var.user.role,
    startDate,
    endDate,
    workers,
    user: c.var.user,
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
  return c.json(
    {
      success: true,
      data: {
        logs,
        paymentsSumValue,
        daysCount,
        OTVSum,
        from,
        to,
        filter: workers || "",
      },
    },
    statusCode.OK
  );
};

// @desc    Create a log
export const createLog = async (c) => {
  let {
    date,
    isAbsent,
    startingTime,
    finishingTime,
    payment,
    remarks,
    worker: workerID,
  } = await c.req.json();
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

  const worker = await Worker.findById(workerID);
  if (!worker)
    throw new ResponseError("Worker not found", statusCode.NOT_FOUND);

  const log = new Log({
    worker: workerID,
    date,
    isAbsent,
    startingTime,
    finishingTime,
    payment,
    remarks,
  });
  await log.save();

  return c.json(
    {
      success: true,
      message: "Log was added successfully",
    },
    statusCode.CREATED
  );
};

// @desc    Get a log
export const getLog = async (c) => {
  const { logID } = c.req.param();
  const log = await Log.aggregate(queryHelper.findLogByID(logID));
  if (c.var.user.role === USER && log.worker.id !== c.var.user.id) {
    throw new ResponseError(
      "You are not authorized to access this log",
      statusCode.NOT_AUTHORIZED
    );
  }

  return c.json(
    {
      success: true,
      data: {
        log: log[0],
      },
    },
    statusCode.OK
  );
};

// @desc    Update a log
export const updateLog = async (c) => {
  const { logID } = c.req.param();
  const body = await c.req.json();
  const { isAbsent, startingTime, finishingTime } = body;

  if (
    (isAbsent === undefined || isAbsent === null) &&
    (!startingTime || !finishingTime)
  ) {
    throw new ResponseError(
      "Please provide a starting time and finishing time",
      statusCode.BAD_REQUEST
    );
  }

  await Log.findByIdAndUpdate(logID, body, {
    new: true,
    runValidators: true,
  });

  return c.json(
    {
      success: true,
      message: "Bill was updated successfully",
    },
    statusCode.OK
  );
};

// @desc    Delete a log
export const deleteLog = async (c) => {
  const { logID } = c.req.param();
  await Log.findByIdAndDelete(logID);

  return c.json(
    {
      success: true,
      message: "Log was deleted successfully",
    },
    statusCode.OK
  );
};
