import Payee from "../models/Payee.model.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import Cheque from "../models/Cheque.model.js";

// @desc    Get all payees
export const getPayees = async (req, res) => {
  const search = req.query.search || "";

  const payees = await Payee.find({
    $or: [
      { name: { $regex: search, $options: "i" } },
      { remarks: { $regex: search, $options: "i" } },
    ],
  });

  return res.status(statusCode.OK).json({
    success: true,
    data: {
      payees,
      search,
    },
  });
};

// @desc    Create a payee
export const createPayee = async (req, res) => {
  const { name, email, phoneNumber, remarks } = req.body;

  await Payee.create({
    name,
    email,
    phoneNumber,
    remarks,
  });

  return res.sendStatus(statusCode.CREATED);
};

// @desc    Get a payee
export const getPayee = async (req, res) => {
  return res.status(statusCode.OK).json({
    success: true,
    data: {
      payee: req.Payee,
    },
  });
};

// @desc    Update a payee
export const updatePayee = async (req, res) => {
  await Payee.findByIdAndUpdate(req.params.payeeID, req.body, {
    new: true,
    runValidators: true,
  });

  return res.sendStatus(statusCode.NO_CONTENT);
};

// @desc    Delete a payee
export const deletePayee = async (req, res) => {
  await Payee.findByIdAndDelete(req.params.payeeID);

  await Cheque.updateMany(
    { payee: req.params.payeeID },
    { $set: { payee: null } }
  );
  return res.sendStatus(statusCode.NO_CONTENT);
};
