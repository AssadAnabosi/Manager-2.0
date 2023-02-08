export const findBills = (startDate, endDate, search) => {
    return [
        {
            $match: {
                date: { $gte: startDate, $lte: endDate },
                $or: [
                    { description: { $regex: search, $options: "i" } },
                    { extraNotes: { $regex: search, $options: "i" } },
                ],
            },
        },
        {
            $project: {
                _id: 1,
                date: 1,
                value: 1,
                description: 1,
                extraNotes: 1,
            },
        },
    ];
};

export const findValueSum = (_id) => {
    const filter = [
        {
            $group: {
                _id: null,
                total: { $sum: "$value" },
            },
        },
    ];

    if (_id)
        filter.unshift({
            $match: {
                _id: { $in: _id },
            },
        });

    return filter;
};