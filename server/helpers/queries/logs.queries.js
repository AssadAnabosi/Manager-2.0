import ObjectID from "../../utils/ObjectID.js";

export const findLogs = ({ search, startDate, endDate }) => {
  const filter = [];
  if (startDate) {
    filter.push({ $match: { date: { $gte: startDate } } });
  }
  if (endDate) {
    filter.push({ $match: { date: { $lte: endDate } } });
  }
  filter.push(
    {
      $lookup: {
        from: "users",
        localField: "worker",
        foreignField: "_id",
        as: "worker",
      },
    },
    {
      $unwind: "$worker",
    },
    {
      $addFields: {
        "worker.name": {
          $concat: ["$worker.firstName", " ", "$worker.lastName"],
        },
      },
    }
  );
  if (search) {
    filter.push({
      $match: { "worker.name": { $regex: search, $options: "i" } },
    });
  }
  filter.push({
    $project: {
      _id: 0,
      id: "$_id",
      date: 1,
      isAbsent: 1,
      startingTime: 1,
      finishingTime: 1,
      OTV: 1,
      payment: 1,
      extraNotes: 1,
      "worker.id": "$worker._id",
      "worker.name": 1,
    },
  });
  return filter;
};

export const findPaymentsSum = (_id) => {
  return [
    {
      $match: {
        _id: { $in: _id },
      },
    },
    {
      $group: {
        _id: null,
        paymentsSum: { $sum: "$payment" },
      },
    },
  ];
};

export const findAttendanceSums = (_id) => {
  return [
    {
      $match: {
        _id: { $in: _id },
        isAbsent: false,
      },
    },
    {
      $group: {
        _id: null,
        daysCount: { $sum: 1 },
        OTVSum: { $sum: "$OTV" },
      },
    },
  ];
};

export const findLogByID = (id) => {
  return [
    {
      $match: {
        _id: ObjectID(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "worker",
        foreignField: "_id",
        as: "worker",
      },
    },
    {
      $unwind: "$worker",
    },
    {
      $addFields: {
        "worker.fullName": {
          $concat: ["$worker.firstName", " ", "$worker.lastName"],
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: "$_id",
        date: 1,
        isAbsent: 1,
        startingTime: 1,
        finishingTime: 1,
        OTV: 1,
        payment: 1,
        extraNotes: 1,
        "worker.id": "$worker._id",
        "worker.fullName": 1,
      },
    },
  ];
};
