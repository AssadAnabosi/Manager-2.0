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
            $project: { _id: 1, serial: 1, dueDate: 1, value: 1, description: 1, "payee.name": 1, "payee._id": 1, isCancelled: 1, isDeleted: 1 }
        },
    ];
};