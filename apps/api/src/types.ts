import type { Env } from "./env";
import type { UserRow } from "./db/schema";

export type AppEnv = {
  Bindings: Env;
  Variables: {
    user: UserRow;
    sessionId: string;
    /** The row loaded by `paramRecord`. */
    record: any;
  };
};
