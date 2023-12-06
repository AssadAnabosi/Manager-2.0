import IsValidID from "../utils/IsValidID.js";

export default (query) => {
  const { from, to } = query;
  let search = query.search || "";
  search = search.trim();
  const filter = query.filter;
  if (filter && !IsValidID(filter)) {
    throw new ResponseError(
      "Please provide a valid filter",
      statusCode.BAD_REQUEST
    );
  }

  let startDate = null;
  let endDate = null;

  if (!from && !to) {
    startDate = getFirstDayOfCurrentMonth(new Date());
    endDate = getLastDayOfCurrentMonth(new Date());
  }

  if (from) {
    startDate = new Date(from);
    // set the time to 00:00:00
    startDate.setUTCHours(0, 0, 0, 0);
  }

  if (to) {
    endDate = new Date(to);
    // set the time to 23:59:59
    endDate.setUTCHours(23, 59, 59, 999);
  }

  return { startDate, endDate, search, filter };
};

const getFirstDayOfCurrentMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1, 12, 0, 0, 0);
  // set time to 00:00:00
  firstDay.setUTCHours(0, 0, 0, 0);
  return firstDay;
};

const getLastDayOfCurrentMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0, 0);
  // set time to 23:59:59
  lastDay.setUTCHours(23, 59, 59, 999);
  return lastDay;
};
