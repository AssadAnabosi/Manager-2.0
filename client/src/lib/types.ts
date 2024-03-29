export type ThemeType = "dark" | "light" | "system";
export type LanguageType = "en" | "ar";

export type UserType = {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  active: boolean;
  theme: string;
  language: string;
};

export type LogType = {
  id: string;
  date: Date | string;
  isAbsent: boolean;
  startingTime: string;
  finishingTime: string;
  OTV: number;
  payment: number;
  remarks: string;
  worker: {
    id: string;
    fullName: string;
  };
};

export type CreateLogType = {
  date: Date | string;
  isAbsent: boolean;
  startingTime: string;
  finishingTime: string;
  OTV: number;
  payment: number;
  remarks: string;
  worker: string;
};

export type BillType = {
  id: string;
  date: Date | string;
  value: number | string;
  description: string;
  remarks: string;
};

export type ChequeType = {
  id: string;
  serial: number | string;
  dueDate: Date | string;
  value: number | string;
  remarks: string;
  isCancelled: boolean;
  payee: {
    id: string;
    name: string;
  };
};

export type PayeeType = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  remarks: string;
};

export type ListType = {
  value: string;
  label: string;
  active?: boolean;
};
