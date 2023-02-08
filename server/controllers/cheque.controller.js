import Cheque from "../models/Cheque.model.js";
import Payee from "../models/Payee.model.js";
import ResponseError from "../utils/responseError.js";
import ReqQueryHelper from "../helpers/reqQuery.helper.js";
import * as queryHelper from "../helpers/queries/cheques.queries.js";

// @desc    Get all Cheques
export const getCheques = async (req, res, next) => {
  const { startDate, endDate, search } = ReqQueryHelper(req.query);
  const filter = queryHelper.findCheques(search, startDate, endDate);

  try {
    const cheques = await Cheque.aggregate(filter).sort({
      dueDate: 1,
      serial: 1,
    });

    const _id = cheques.map(({ _id }) => _id);

    let ValueSum = await Cheque.aggregate(queryHelper.findValueSum(_id));
    if (ValueSum.length < 1) ValueSum = [{ total: 0 }];

    return res.status(200).json({
      success: true,
      data: {
        cheques,
        total: ValueSum[0].total,
        startDate,
        endDate,
        search,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a Cheque
export const createCheque = async (req, res, next) => {
  const { serial, dueDate, value, description, isCancelled } = req.body;

  try {
    const payee = await Payee.findById(req.body.payee);
    if (!payee) return next(new ResponseError("Payee not found", 404));

    const cheque = new Cheque({
      serial,
      dueDate,
      value,
      description,
      payee,
      isCancelled,
    });
    await cheque.save();

    return res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a Cheque
export const getCheque = async (req, res, next) => {
  const filter = queryHelper.findChequeByID(req.params.chequeID);

  try {
    const cheque = await Cheque.aggregate(filter);
    if (!cheque || cheque.length === 0)
      return next(new ResponseError("Cheque not found", 404));

    return res.status(200).json({
      success: true,
      data: cheque,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a Cheque
export const updateCheque = async (req, res, next) => {
  try {
    // Check if the cheque exists
    const cheque = await Cheque.findById(req.params.chequeID);
    if (!cheque) return next(new ResponseError("Cheque not found", 404));
    // Check if the payee exists
    if (req.body.payee) {
      const payee = await Payee.findById(req.body.payee);
      if (!payee) return next(new ResponseError("Payee not found", 404));
    }
    // Update the cheque
    await Cheque.findByIdAndUpdate(req.params.chequeID, req.body, {
      new: true,
      runValidators: true,
    });

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Cheque
export const deleteCheque = async (req, res, next) => {
  try {
    const cheque = await Cheque.findById(req.params.chequeID);
    if (!cheque) return next(new ResponseError("Cheque not found", 404));

    await Cheque.findByIdAndDelete(req.params.chequeID);

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
