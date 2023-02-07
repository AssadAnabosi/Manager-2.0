import Payee from "../models/Payee.model.js";
import ResponseError from "../utils/ResponseError.js";

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

    return res.status(200).json({
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

    return res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a payee
export const getPayee = async (req, res, next) => {
  try {
    const payee = await Payee.findById(req.params.payeeID).select("-__v");
    if (!payee) return next(new ResponseError("Payee not found", 404));

    return res.status(200).json({
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
    if (!payee) return next(new ResponseError("Payee not found", 404));

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a payee
export const deletePayee = async (req, res, next) => {
  try {
    const payee = await Payee.findById(req.params.payeeID);
    if (!payee) return next(new ResponseError("Payee not found", 404));

    await Payee.findByIdAndDelete(req.params.payeeID);

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
