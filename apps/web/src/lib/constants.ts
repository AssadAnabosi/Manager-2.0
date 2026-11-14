import {
  USER,
  SPECTATOR,
  MODERATOR,
  ADMIN,
  ROLES as SHARED_ROLES,
} from "@workbench/shared";

export { USER, SPECTATOR, MODERATOR, ADMIN };

export const ROLES: string[] = [...SHARED_ROLES];

export const DATE_FORMAT = "EEEE, dd/LL/y";
