export const findBills = (startDate, endDate, search) => {
  const filter = [];
  if (startDate)
    filter.push({
      $match: {
        date: { $gte: startDate },
      },
    });
  if (endDate)
    filter.push({
      $match: {
        date: { $lte: endDate },
      },
    });
  if (search)
    filter.push({
      $match: {
        $or: [
          { description: { $regex: search, $options: "i" } },
          { extraNotes: { $regex: search, $options: "i" } },
        ],
      },
    });

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
      value: 1,
      description: 1,
      extraNotes: 1,
    },
  });
  return filter;
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
