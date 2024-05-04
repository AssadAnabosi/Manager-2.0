import Cheque from "../models/Cheque.model.js";
import Payee from "../models/Payee.model.js";
import ResponseError from "../utils/responseError.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import ReqQueryHelper from "../helpers/reqQuery.helper.js";
import * as queryHelper from "../helpers/queries/cheques.queries.js";

// @desc    Get all Cheques
export const getCheques = async (c) => {
  const {
    startDate,
    endDate,
    filter: payees,
    serial,
  } = ReqQueryHelper(c.req.query());
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
  return c.json(
    {
      success: true,
      data: {
        cheques,
        total,
        from,
        to,
        serial,
        filter: payees || "",
      },
    },
    statusCode.OK
  );
};

// @desc    Create a Cheque
export const createCheque = async (c) => {
  const body = await c.req.json();
  let { serial, dueDate, value, remarks, isCancelled } = body;
  dueDate = new Date(dueDate);
  dueDate.setUTCHours(0, 0, 0, 0);
  if (isCancelled === false && (body.payee === "" || !body.payee)) {
    throw new ResponseError("Please select a payee", statusCode.BAD_REQUEST);
  }

  let payee = null;
  if (body.payee && body.payee !== "") {
    payee = await Payee.findById(body.payee);
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

  return c.json(
    {
      success: true,
      message: "Cheque was created successfully",
    },
    statusCode.CREATED
  );
};

// @desc    Get a Cheque
export const getCheque = async (c) => {
  const { chequeID } = c.req.param();
  const filter = queryHelper.findChequeByID(chequeID);

  const cheque = await Cheque.aggregate(filter);

  return c.json(
    {
      success: true,
      data: {
        cheque: cheque[0],
      },
    },
    statusCode.OK
  );
};

// @desc    Update a Cheque
export const updateCheque = async (c) => {
  const { chequeID } = c.req.param();
  const body = await c.req.json();

  if (body.payee === "") {
    body.payee = null;
  } else {
    const payee = await Payee.findById(body.payee);
    if (!payee)
      throw new ResponseError("Payee not found", statusCode.NOT_FOUND);
    body.payee = payee;
  }
  if (body.dueDate) {
    body.dueDate = new Date(body.dueDate);
    body.dueDate.setUTCHours(0, 0, 0, 0);
  }
  // Update the cheque
  await Cheque.findByIdAndUpdate(chequeID, body, {
    new: true,
    runValidators: true,
  });

  return c.json(
    {
      success: true,
      message: "Cheque was updated successfully",
    },
    statusCode.OK
  );
};

// @desc    Delete a Cheque
export const deleteCheque = async (c) => {
  const { chequeID } = c.req.param();
  await Cheque.findByIdAndDelete(chequeID);

  return c.json(
    {
      success: true,
      message: "Cheque was deleted successfully",
    },
    statusCode.OK
  );
};
