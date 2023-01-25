import mongoose from "mongoose";
export const logsQuery = (search, startDate, endDate) => {
    return [
        {
            $lookup: {
                from: "users",
                localField: "worker",
                foreignField: "_id",
                as: "worker"
            }
        },
        {
            $unwind: '$worker'
        },
        {
            $addFields: {
                "worker.name": { $concat: ["$worker.firstName", " ", "$worker.lastName"] }
            }
        },
        {
            $match: {
                "date": { $gte: startDate, $lte: endDate },
                "worker.name": { $regex: search, $options: "i" },
            }
        },
        {
            $project: {
                _id: 1,
                date: 1,
                isAbsence: 1,
                startingTime: 1,
                finishingTime: 1,
                OTV: 1,
                payment: 1,
                extraNotes: 1,
                "worker._id": 1,
                "worker.name": 1
            }
        }
    ];
};

export const logsPaymentsSum = (_id) => {
    return [
        {
            $match: {
                _id: { "$in": _id }
            }
        },
        {
            $group: {
                _id: null,
                paymentsSum: { $sum: "$payment" },
            }
        }
    ];
};

export const logsAttendanceSums = (_id) => {
    return [{
        $match: {
            _id: { "$in": _id },
            isAbsence: false
        }
    },
    {
        $group: {
            _id: null,
            daysCount: { "$sum": 1 },
            OTVSum: { $sum: "$OTV" }
        }
    }
    ];
};

export const logQuery = (id) => {
    return [
        {
            $match: {
                _id: mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "worker",
                foreignField: "_id",
                as: "worker"
            }
        },
        {
            $unwind: '$worker'
        },
        {
            $addFields: {
                "worker.fullName": { $concat: ["$worker.firstName", " ", "$worker.lastName"] }
            }
        },
        {
            $project: {
                _id: 1,
                date: 1,
                isAbsence: 1,
                startingTime: 1,
                finishingTime: 1,
                OTV: 1,
                payment: 1,
                extraNotes: 1,
                "worker._id": 1,
                "worker.fullName": 1
            }
        }
    ];
};

export const chequesQuery = (search, startDate, endDate) => {
    return [
        {
            $lookup: {
                from: "payees",
                localField: "payee",
                foreignField: "_id",
                as: "payee"
            }
        },
        {
            $match: {
                $or: [
                    {
                        $and: [
                            { "dueDate": { $gte: startDate, $lte: endDate } },
                            {
                                $or: [
                                    { "payee.name": { $regex: search, $options: "i" } },
                                    { "isDeleted": true },
                                    { "isCancelled": true }
                                ]
                            }

                        ]
                    },
                    {
                        "serial": { $eq: parseInt(search) }
                    }
                ]
            }
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
                isDeleted: 1
            }
        },
    ];
};

export const chequesValueSum = (_id) => {
    return [
        {
            $match:
            {
                _id: { "$in": _id },
                "isCancelled": false,
            }
        },
        {
            $group:
            {
                _id: null,
                total: { $sum: "$value" }
            }
        },
    ];
};

export const chequeQuery = (id) => {
    return [
        {
            $match: {
                _id: mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup: {
                from: "payees",
                localField: "payee",
                foreignField: "_id",
                as: "payee"
            }
        },
        {
            $unwind: '$payee'
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
                isDeleted: 1
            }
        }
    ];
};