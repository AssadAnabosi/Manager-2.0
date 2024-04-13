import ObjectID from "../../utils/ObjectID.js";

export const findCheques = ({ serial: search, startDate, endDate, payees }) => {
  const filter = [];
  const serial = parseInt(search) | 0;
  const dueDateFilter = {};
  if (startDate) {
    dueDateFilter.$gte = startDate;
  }
  if (endDate) {
    dueDateFilter.$lte = endDate;
  }

  if (serial && serial !== 0) {
    filter.push({
      $match: {
        serial: { $eq: serial },
      },
    });
  } else {
    const and = [
      {
        dueDate: dueDateFilter,
      },
    ];
    if (payees && payees.length > 0) {
      and.push({
        payee: {
          $in: payees.map((payee) => ObjectID(payee)),
        },
      });
    }
    filter.push({
      $match: {
        $and: and,
      },
    });
  }

  filter.push({
    $lookup: {
      from: "payees",
      localField: "payee",
      foreignField: "_id",
      as: "payee",
    },
  });
  filter.push({
    $unwind: {
      path: "$payee",
      preserveNullAndEmptyArrays: true,
    },
  });
  filter.push({
    $project: {
      _id: 0,
      id: "$_id",
      serial: 1,
      dueDate: 1,
      value: 1,
      remarks: 1,
      "payee.id": {
        $ifNull: ["$payee._id", null],
      },
      "payee.name": {
        $ifNull: ["$payee.name", "Deleted Payee"],
      },
      isCancelled: 1,
    },
  });
  filter.push({
    $sort: {
      dueDate: 1,
      serial: 1,
    },
  });
  return filter;
};

export const findValueSum = (_id) => {
  return [
    {
      $match: {
        _id: { $in: _id },
        isCancelled: false,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$value" },
      },
    },
  ];
};

export const findChequeByID = (id) => {
  return [
    {
      $match: {
        _id: ObjectID(id),
      },
    },
    {
      $lookup: {
        from: "payees",
        localField: "payee",
        foreignField: "_id",
        as: "payee",
      },
    },
    {
      $unwind: {
        path: "$payee",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        id: "$_id",
        serial: 1,
        dueDate: 1,
        value: 1,
        remarks: 1,
        "payee.id": {
          $ifNull: ["$payee._id", null],
        },
        "payee.name": {
          $ifNull: ["$payee.name", "Deleted Payee"],
        },
        isCancelled: 1,
      },
    },
  ];
};
