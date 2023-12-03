import ObjectID from "../../utils/ObjectID.js";
import { USER } from "../../utils/constants/userRoles.js";

export const findLogs = ({ userRole, worker, startDate, endDate }) => {
  const filter = [];
  if (userRole === USER) {
    filter.push({ $match: { worker: ObjectID(req.user.id) } });
  }
  if (startDate) {
    filter.push({ $match: { date: { $gte: startDate } } });
  }
  if (endDate) {
    filter.push({ $match: { date: { $lte: endDate } } });
  }
  if (userRole !== USER && worker && worker !== "") {
    filter.push({
      $match: { worker: ObjectID(worker) },
    });
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
        "worker.fullName": {
          $concat: ["$worker.firstName", " ", "$worker.lastName"],
        },
      },
    }
  );
  filter.push({
    $sort: {
      date: -1,
    },
  });
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
      remarks: 1,
      "worker.id": "$worker._id",
      "worker.fullName": 1,
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
        remarks: 1,
        "worker.id": "$worker._id",
        "worker.fullName": 1,
      },
    },
  ];
};
