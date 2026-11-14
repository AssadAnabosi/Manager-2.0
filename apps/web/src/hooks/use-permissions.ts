import { useAuth } from "@/providers/auth-context";
import { ADMIN, MODERATOR } from "@/lib/constants";

/**
 * What the signed-in user may do, mirroring docs/roles-and-rules.md.
 * The API is the authority; this only decides which controls to show.
 */
export function usePermissions() {
  const role = useAuth().user?.role;
  const isStaff = role === MODERATOR || role === ADMIN;
  return {
    /** Create, update and delete logs, bills, payees and cheques. */
    canWrite: isStaff,
    /** Create users (moderators can, but can't edit or delete them). */
    canCreateUsers: isStaff,
    /** Update, delete and reset users. */
    canManageUsers: role === ADMIN,
  };
}

export type Permissions = ReturnType<typeof usePermissions>;
