import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toList(array: any[], value: string) {
  return array.map((item: any) => {
    return {
      value: item[value].toLowerCase(),
      label: item[value],
    };
  });
}
