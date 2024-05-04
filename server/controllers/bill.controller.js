import Bill from "../models/Bill.model.js";
import { OK, CREATED } from "../utils/constants/statusCodes.js";
import ReqQueryHelper from "../helpers/reqQuery.helper.js";
import * as queryHelper from "../helpers/queries/bills.queries.js";

// @desc    Get all bills
export const getBills = async (c) => {
  const { startDate, endDate, search } = ReqQueryHelper(c.req.query());
  const bills = await Bill.aggregate(
    queryHelper.findBills(startDate, endDate, search)
  );

  const _id = bills.map(({ id }) => id);

  let allTimeTotal = (await Bill.aggregate(queryHelper.findValueSum()))[0];
  const allTimeTotalValue = allTimeTotal ? allTimeTotal.total : 0;

  let rangeTotal = (await Bill.aggregate(queryHelper.findValueSum(_id)))[0];
  const rangeTotalValue = rangeTotal ? rangeTotal.total : 0;
  const from = startDate ? startDate.toISOString().substring(0, 10) : "";
  const to = endDate ? endDate.toISOString().substring(0, 10) : "";
  return c.json(
    {
      success: true,
      data: {
        bills,
        allTimeTotalValue,
        rangeTotalValue,
        from,
        to,
        search,
      },
    },
    OK
  );
};

// @desc    Create a bill
export const createBill = async (c) => {
  let { date, value, description, remarks } = await c.req.json();
  date = new Date(date);
  date.setUTCHours(0, 0, 0, 0);
  await Bill.create({
    date,
    value,
    description,
    remarks,
  });
  return c.json(
    {
      success: true,
      message: "Bill was added successfully",
    },
    CREATED
  );
};

// @desc    Get a bill
export const getBill = async (c) => {
  return c.json(
    {
      success: true,
      data: {
        bill: c.var.Bill,
      },
    },
    OK
  );
};

// @desc    Update a bill
export const updateBill = async (c) => {
  const { billID } = c.req.param();
  const body = await c.req.json();
  if (body.date) {
    body.date = new Date(body.date);
    body.date.setUTCHours(0, 0, 0, 0);
  }
  await Bill.findByIdAndUpdate(billID, body, {
    new: true,
    runValidators: true,
  });

  return c.json(
    {
      success: true,
      message: "Bill was updated successfully",
    },
    OK
  );
};

// @desc    Delete a bill
export const deleteBill = async (c) => {
  const { billID } = c.req.param();
  await Bill.findByIdAndDelete(billID);

  return c.json(
    {
      success: true,
      message: "Bill was deleted successfully",
    },
    OK
  );
};
