import Payee from "../models/Payee.model.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import Cheque from "../models/Cheque.model.js";

// @desc    Get all payees
export const getPayees = async (c) => {
  const search = c.req.query("search") || "";

  const payees = await Payee.find({
    $or: [
      { name: { $regex: search, $options: "i" } },
      { remarks: { $regex: search, $options: "i" } },
    ],
  });

  return c.json(
    {
      success: true,
      data: {
        payees,
        search,
      },
    },
    statusCode.OK
  );
};

// @desc    Create a payee
export const createPayee = async (c) => {
  const body = await c.req.json();
  const { name, email, phoneNumber, remarks } = body;

  await Payee.create({
    name,
    email,
    phoneNumber,
    remarks,
  });

  return c.json(
    {
      success: true,
      message: "Payee was created successfully",
    },
    statusCode.CREATED
  );
};

// @desc    Get a payee
export const getPayee = async (c) => {
  return c.json(
    {
      success: true,
      data: {
        payee: c.var.Payee,
      },
    },
    statusCode.OK
  );
};

// @desc    Update a payee
export const updatePayee = async (c) => {
  const { payeeID } = c.req.param();
  const body = await c.req.json();

  await Payee.findByIdAndUpdate(payeeID, body, {
    new: true,
    runValidators: true,
  });

  return c.json(
    {
      success: true,
      message: "Payee was updated successfully",
    },
    statusCode.OK
  );
};

// @desc    Delete a payee
export const deletePayee = async (c) => {
  const { payeeID } = c.req.param();
  await Payee.findByIdAndDelete(payeeID);

  await Cheque.updateMany({ payee: payeeID }, { $set: { payee: null } });
  return c.json(
    {
      success: true,
      message: "Payee was deleted successfully",
    },
    statusCode.OK
  );
};
