import Cheque from "../models/Cheque.model.js";
import Payee from "../models/Payee.model.js";
import ResponseError from "../utils/responseError.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import ReqQueryHelper from "../helpers/reqQuery.helper.js";
import * as queryHelper from "../helpers/queries/cheques.queries.js";

// @desc    Get all Cheques
export const getCheques = async (req, res) => {
  const {
    startDate,
    endDate,
    filter: payees,
    serial,
  } = ReqQueryHelper(req.query);
  const filter = queryHelper.findCheques({
    serial,
    startDate,
    endDate,
    payees,
  });

  const cheques = await Cheque.aggregate(filter);

  const _id = cheques.map(({ id }) => id);

  let ValueSum = (await Cheque.aggregate(queryHelper.findValueSum(_id)))[0];
  const total = ValueSum ? ValueSum.total : 0;

  const from = startDate ? startDate.toISOString().substring(0, 10) : "";
  const to = endDate ? endDate.toISOString().substring(0, 10) : "";
  return res.status(statusCode.OK).json({
    success: true,
    data: {
      cheques,
      number: cheques.length,
      total,
      from,
      to,
      serial,
      filter: payees || "",
    },
  });
};

// @desc    Create a Cheque
export const createCheque = async (req, res) => {
  let { serial, dueDate, value, remarks, isCancelled } = req.body;
  dueDate = new Date(dueDate);
  dueDate.setUTCHours(0, 0, 0, 0);
  if (isCancelled === false && (req.body.payee === "" || !req.body.payee)) {
    throw new ResponseError("Please select a payee", statusCode.BAD_REQUEST);
  }

  let payee = null;
  if (req.body.payee && req.body.payee !== "") {
    payee = await Payee.findById(req.body.payee);
    if (!payee)
      throw new ResponseError("Payee not found", statusCode.NOT_FOUND);
  }

  const cheque = new Cheque({
    serial,
    dueDate,
    value,
    remarks,
    payee,
    isCancelled,
  });
  await cheque.save();

  return res.sendStatus(statusCode.CREATED);
};

// @desc    Get a Cheque
export const getCheque = async (req, res) => {
  const filter = queryHelper.findChequeByID(req.params.chequeID);

  const cheque = await Cheque.aggregate(filter);

  return res.status(statusCode.OK).json({
    success: true,
    data: {
      cheque: cheque[0],
    },
  });
};

// @desc    Update a Cheque
export const updateCheque = async (req, res) => {
  if (req.body.payee === "") {
    req.body.payee = null;
  } else {
    const payee = await Payee.findById(req.body.payee);
    if (!payee)
      throw new ResponseError("Payee not found", statusCode.NOT_FOUND);
    req.body.payee = payee;
  }
  if (req.body.dueDate) {
    req.body.dueDate = new Date(req.body.dueDate);
    req.body.dueDate.setUTCHours(0, 0, 0, 0);
  }
  // Update the cheque
  await Cheque.findByIdAndUpdate(req.params.chequeID, req.body, {
    new: true,
    runValidators: true,
  });

  return res.sendStatus(statusCode.NO_CONTENT);
};

// @desc    Delete a Cheque
export const deleteCheque = async (req, res) => {
  await Cheque.findByIdAndDelete(req.params.chequeID);

  return res.sendStatus(statusCode.NO_CONTENT);
};
