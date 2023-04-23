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

  const _id = bills.map(({ _id }) => _id);

  let allTimeTotal = await Bill.aggregate(queryHelper.findValueSum());
  if (allTimeTotal.length < 1) allTimeTotal = [{ total: 0 }];

  let rangeTotal = await Bill.aggregate(queryHelper.findValueSum(_id));
  if (rangeTotal.length < 1) rangeTotal = [{ total: 0 }];

  return res.status(statusCode.OK).json({
    success: true,
    data: {
      bills,
      allTimeTotal: allTimeTotal[0].total,
      rangeTotal: rangeTotal[0].total,
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
  date.setUTCHours(date.getUTCHours() + 2);
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
  const bill = await Bill.findById(req.params.billID).select("-__v");
  if (!bill)
    return next(new ResponseError("Bill not found", statusCode.NOT_FOUND));

  return res.status(statusCode.OK).json({
    success: true,
    data: bill,
  });
};

// @desc    Update a bill
export const updateBill = async (req, res, next) => {
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
