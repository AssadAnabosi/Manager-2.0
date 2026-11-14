/** Normalize to UTC midnight of the same UTC day. */
export const startOfUtcDay = (d: Date): Date => {
  const r = new Date(d);
  r.setUTCHours(0, 0, 0, 0);
  return r;
};

export const endOfUtcDay = (d: Date): Date => {
  const r = new Date(d);
  r.setUTCHours(23, 59, 59, 999);
  return r;
};

export const firstDayOfCurrentMonth = (now = new Date()): Date =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

export const lastDayOfCurrentMonth = (now = new Date()): Date =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

export const toDayString = (d: Date): string => d.toISOString().slice(0, 10);
