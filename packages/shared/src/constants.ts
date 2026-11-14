export const USER = "User";
export const SPECTATOR = "Spectator";
export const MODERATOR = "Moderator";
export const ADMIN = "Administrator";

export const ROLES = [USER, SPECTATOR, MODERATOR, ADMIN] as const;
export type Role = (typeof ROLES)[number];

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export const LANGUAGES = ["en", "ar"] as const;
export type Language = (typeof LANGUAGES)[number];

export const BILL_TYPES = ["expense", "income"] as const;
export type BillType = (typeof BILL_TYPES)[number];
