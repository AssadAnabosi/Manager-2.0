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
};

export type LogType = {
  id: string;
  date: Date | string;
  isAbsent: boolean;
  startingTime: string;
  finishingTime: string;
  OTV: number;
  payment: number;
  extraNotes: string;
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
  extraNotes: string;
};

export type ChequeType = {
  id: string;
  serial: number;
  dueDate: Date | string;
  value: number;
  description: string;
  isCancelled: boolean;
  payee: {
    id: string;
    name: string;
  };
};

export type PayeeType = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  active: boolean;
  theme: string;
  language: string;
};
