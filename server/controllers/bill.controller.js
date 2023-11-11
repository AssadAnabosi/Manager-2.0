import Bill from "../models/Bill.model.js";
import ResponseError from "../utils/responseError.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import ReqQueryHelper from "../helpers/reqQuery.helper.js";
import * as queryHelper from "../helpers/queries/bills.queries.js";

// @desc    Get all bills
export const getBills = async (req, res, next) => {
  const { startDate, endDate, search } = ReqQueryHelper(req.query);
  const bills = await Bill.aggregate(
    queryHelper.findBills(startDate, endDate, search)
  ).sort({ date: -1 });

  const _id = bills.map(({ id }) => id);

  let allTimeTotal = (await Bill.aggregate(queryHelper.findValueSum()))[0];
  const allTimeTotalValue = allTimeTotal ? allTimeTotal.total : 0;

  let rangeTotal = (await Bill.aggregate(queryHelper.findValueSum(_id)))[0];
  const rangeTotalValue = rangeTotal ? rangeTotal.total : 0;

  return res.status(statusCode.OK).json({
    success: true,
    data: {
      bills,
      allTimeTotalValue,
      rangeTotalValue,
      startDate: startDate.toISOString().substring(0, 10),
      endDate: endDate.toISOString().substring(0, 10),
      search,
    },
  });
};

// @desc    Create a bill
export const createBill = async (req, res, next) => {
  let { date, value, description, extraNotes } = req.body;
  date = new Date(date);
  date.setUTCHours(0, 0, 0, 0);
  await Bill.create({
    date,
    value,
    description,
    extraNotes,
  });

  return res.sendStatus(statusCode.CREATED);
};

// @desc    Get a bill
export const getBill = async (req, res, next) => {
  const bill = await Bill.findById(req.params.billID);
  if (!bill)
    return next(new ResponseError("Bill not found", statusCode.NOT_FOUND));

  return res.status(statusCode.OK).json({
    success: true,
    data: {
      bill,
    },
  });
};

// @desc    Update a bill
export const updateBill = async (req, res, next) => {
  if (req.body.date) {
    req.body.date = new Date(req.body.date);
    req.body.date.setUTCHours(0, 0, 0, 0);
  }
  const bill = await Bill.findByIdAndUpdate(req.params.billID, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bill)
    return next(new ResponseError("Bill not found", statusCode.NOT_FOUND));

  return res.sendStatus(statusCode.NO_CONTENT);
};

// @desc    Delete a bill
export const deleteBill = async (req, res, next) => {
  const bill = await Bill.findByIdAndDelete(req.params.billID);
  if (!bill)
    return next(new ResponseError("Bill not found", statusCode.NOT_FOUND));

  return res.sendStatus(statusCode.NO_CONTENT);
};
