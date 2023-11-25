import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export function toList(array: any[], value: string) {
  return array.map((item: any) => {
    return {
      value: item[value].toLowerCase(),
      label: item[value],
    };
  });
}

export const currencyFormatter = (amount: any) => {
  if (typeof amount !== "number") {
    amount = 0;
  }
  const formatter = new Intl.NumberFormat("en-gb", {
    currency: "ILS",
    style: "currency",
  });
  return formatter.format(amount);
};
