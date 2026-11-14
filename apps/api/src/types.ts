import type { Env } from "./env";
import type { UserRow } from "./db/schema";

export type AppEnv = {
  Bindings: Env;
  Variables: {
    user: UserRow;
    sessionId: string;
  };
};
