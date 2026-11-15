# Roles and rules

## Roles

1. **User**: can only view their own logs and change their own password and preferences.
2. **Spectator**: can view all bills, workers, logs, payees and cheques, but can't edit anything besides their own password and preferences.
3. **Moderator**: can do what a Spectator can, and can add, edit and delete logs, bills, payees and cheques. Can create users but can't update or delete a user.
4. **Administrator**: the highest level of access; can do anything.

## Access matrix

| Area | User | Spectator | Moderator | Administrator |
| --- | --- | --- | --- | --- |
| Own account (`/auth`, own password, own preferences) | yes | yes | yes | yes |
| Logs (read) | own only | all | all | all |
| Logs (create, update, delete) | no | no | yes | yes |
| Bills, payees, cheques (read) | no | yes | yes | yes |
| Bills, payees, cheques (create, update, delete) | no | no | yes | yes |
| Users (list, read) | no | yes | yes | yes |
| Users (create, check username) | no | no | yes | yes |
| Users (update, delete, reset password, change role/status/loggable) | no | no | no | yes |

## Restrictions

**User**
- An administrator can't delete themself.
- An administrator can't deactivate themself.
- An administrator can't change their own role.
- An administrator resetting a user's password revokes all of that user's refresh tokens.
- A moderator can't edit or delete any user.

**Log**
- A log's worker and date can't be changed.
- A log has either a `startingTime` and a `finishingTime`, or `isAbsent = true`; never both and never neither.
- A worker has at most one log per date.

**Payee**
- Deleting a payee sets the payee to null on its cheques.

**Login**
- Deactivated users can't log in; this is checked only after the password matches.
