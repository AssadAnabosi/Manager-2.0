import ObjectID from "../../utils/ObjectID.js";

export const findCheques = ({ search, startDate, endDate }) => {
  const filter = [];
  if (startDate) {
    filter.push({ $match: { dueDate: { $gte: startDate } } });
  }
  if (endDate) {
    filter.push({ $match: { dueDate: { $lte: endDate } } });
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
  if (search) {
    filter.push({
      $match: {
        $or: [
          { "payee.name": { $regex: search, $options: "i" } },
          { serial: { $eq: parseInt(search) } },
        ],
      },
    });
  }
  filter.push({
    $project: {
      _id: 0,
      id: "$_id",
      serial: 1,
      dueDate: 1,
      value: 1,
      description: 1,
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
        description: 1,
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
