export default (query) => {
    const { start, end } = query;
    const search = query.search || "";

    const startDate = getFirstDayOfCurrentMonth(new Date());
    const endDate = getLastDayOfCurrentMonth(new Date());

    if (start) {
        startDate = new Date(start);
    }

    if (end) {
        endDate = new Date(end);
    }

    return { startDate, endDate, search };
}

const getFirstDayOfCurrentMonth = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1, 12, 0, 0, 0);
    firstDay.setUTCHours(firstDay.getUTCHours() + 2);
    return firstDay;
}

const getLastDayOfCurrentMonth = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0, 12, 0, 0, 0);
    lastDay.setUTCHours(lastDay.getUTCHours() + 2);
    return lastDay;
}
