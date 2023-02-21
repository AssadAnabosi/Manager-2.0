import Payee from "../models/Payee.model.js";
import ResponseError from "../utils/responseError.js";
import * as statusCode from "../utils/constants/statusCodes.js";

// @desc    Get all payees
export const getPayees = async (req, res, next) => {
  const search = req.query.search || "";

  try {
    const payees = await Payee.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { extraNotes: { $regex: search, $options: "i" } },
      ],
    }).select("-cheques -__v");

    return res.status(statusCode.OK).json({
      success: true,
      data: {
        payees,
        search,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a payee
export const createPayee = async (req, res, next) => {
  const { name, email, phoneNumber, extraNotes } = req.body;

  try {
    await Payee.create({
      name,
      email,
      phoneNumber,
      extraNotes,
    });

    return res.sendStatus(statusCode.CREATED);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a payee
export const getPayee = async (req, res, next) => {
  try {
    const payee = await Payee.findById(req.params.payeeID).select("-__v");
    if (!payee)
      return next(new ResponseError("Payee not found", statusCode.NOT_FOUND));

    return res.status(statusCode.OK).json({
      success: true,
      data: payee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a payee
export const updatePayee = async (req, res, next) => {
  try {
    const payee = await Payee.findByIdAndUpdate(req.params.payeeID, req.body, {
      new: true,
      runValidators: true,
    });
    if (!payee)
      return next(new ResponseError("Payee not found", statusCode.NOT_FOUND));

    return res.sendStatus(statusCode.NO_CONTENT);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a payee
export const deletePayee = async (req, res, next) => {
  try {
    const payee = await Payee.findById(req.params.payeeID);
    if (!payee)
      return next(new ResponseError("Payee not found", statusCode.NOT_FOUND));

    await Payee.findByIdAndDelete(req.params.payeeID);

    return res.sendStatus(statusCode.NO_CONTENT);
  } catch (error) {
    next(error);
  }
};
