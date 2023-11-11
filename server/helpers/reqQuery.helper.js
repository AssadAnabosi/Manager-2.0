export default (query) => {
  const { start, end } = query;
  let search = query.search || "";
  search = search.trim();

  let startDate = getFirstDayOfCurrentMonth(new Date());
  let endDate = getLastDayOfCurrentMonth(new Date());

  if (start) {
    startDate = new Date(start);
    // set the time to 00:00:00
    startDate.setUTCHours(0, 0, 0, 0);
  }

  if (end) {
    endDate = new Date(end);
    // set the time to 23:59:59
    endDate.setUTCHours(23, 59, 59, 999);
  }

  return { startDate, endDate, search };
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
