import ObjectID from "../../utils/ObjectID.js";

export const findCheques = (search, startDate, endDate) => {
  return [
    {
      $lookup: {
        from: "payees",
        localField: "payee",
        foreignField: "_id",
        as: "payee",
      },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              { dueDate: { $gte: startDate, $lte: endDate } },
              {
                $or: [
                  { "payee.name": { $regex: search, $options: "i" } },
                  { isDeleted: true },
                  { isCancelled: true },
                ],
              },
            ],
          },
          {
            serial: { $eq: parseInt(search) },
          },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        serial: 1,
        dueDate: 1,
        value: 1,
        description: 1,
        "payee.name": 1,
        "payee._id": 1,
        isCancelled: 1,
        isDeleted: 1,
      },
    },
  ];
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
      $unwind: "$payee",
    },
    {
      $project: {
        _id: 1,
        serial: 1,
        dueDate: 1,
        value: 1,
        description: 1,
        "payee.name": 1,
        "payee._id": 1,
        isCancelled: 1,
        isDeleted: 1,
      },
    },
  ];
};
