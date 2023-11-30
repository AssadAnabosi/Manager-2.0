export type ThemeType = "dark" | "light" | "system";
export type LanguageType = "en" | "ar";

export type UserType = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  active: boolean;
  theme: string;
  language: string;
  accessToken?: string;
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

export type BillType = {
  id: string;
  date: Date | string;
  value: number;
  description: string;
  remarks: string;
};

export type ChequeType = {
  id: string;
  serial: number;
  dueDate: Date | string;
  value: number;
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

export type AlertType = {
  title?: string;
  description: string;
};
