export const getFirstDayOfCurrentMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1, 12, 0, 0, 0);
  // set time to 00:00:00
  firstDay.setHours(0, 0, 0, 0);
  return firstDay;
};

export const getLastDayOfCurrentMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0, 0);
  // set time to 23:59:59
  lastDay.setHours(23, 59, 59, 999);
  return lastDay;
};
