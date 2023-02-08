import ObjectID from "../../utils/ObjectID.js";

export const findLogs = (search, startDate, endDate) => {
    return [
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
        },
        {
            $match: {
                date: { $gte: startDate, $lte: endDate },
                "worker.name": { $regex: search, $options: "i" },
            },
        },
        {
            $project: {
                _id: 1,
                date: 1,
                isAbsent: 1,
                startingTime: 1,
                finishingTime: 1,
                OTV: 1,
                payment: 1,
                extraNotes: 1,
                "worker._id": 1,
                "worker.name": 1,
            },
        },
    ];
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
                _id: 1,
                date: 1,
                isAbsent: 1,
                startingTime: 1,
                finishingTime: 1,
                OTV: 1,
                payment: 1,
                extraNotes: 1,
                "worker._id": 1,
                "worker.fullName": 1,
            },
        },
    ];
};
