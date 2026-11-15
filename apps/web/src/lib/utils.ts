import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ListType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getToday = () => {
  const date = new Date();
  // set time to 00:00:00
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getLastDayOfCurrentMonthDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0, 0);
  // set time to 23:59:59
  lastDay.setHours(0, 0, 0, 0);
  return lastDay;
};

export const getFirstDayOfCurrentMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1, 12, 0, 0, 0);
  // set time to 00:00:00
  firstDay.setHours(0, 0, 0, 0);
  return dateToString(firstDay);
};

export const getLastDayOfCurrentMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0, 0);
  lastDay.setHours(0, 0, 0, 0);
  return dateToString(lastDay);
};

export const dateToString = (date: any) => {
  return format(Number(date), "y-LL-dd");
};

export const stringToDate = (string: any) => {
  return new Date(string);
};

export function toList(
  array: any[],
  value: string,
  active = false
): ListType[] {
  return array.map((item: any) => {
    return {
      value: item.id,
      label: item[value],
      active: active ? item["active"] : true,
      loggable: item["loggable"] !== false,
    };
  });
}
