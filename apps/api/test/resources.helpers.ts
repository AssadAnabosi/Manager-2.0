import type { Role } from "@workbench/shared";
import { createUser, resetDb, TEST_PASSWORD, type Client } from "./helpers";

export { resetDb, TEST_PASSWORD };

/** Creates a user with `role` and returns an access token for it. */
export const as = async (api: Client, role: Role, username = role.toLowerCase()) => {
  const user = await createUser({
    username,
    role,
    firstName: "First",
    lastName: role,
  });
  const { token } = await api.login(username);
  return { user, token };
};

export const body = async (res: Response) => (await res.json()) as any;

export const ROLES_ALL: Role[] = ["User", "Spectator", "Moderator", "Administrator"];
