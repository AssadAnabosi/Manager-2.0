import {
  reqBodyIncludes,
  reqBodyExcludes,
} from "../reqValidators.middleware.js";

const createRules = ["username", "password", "firstName", "lastName"];
export const validateRegisterUser = reqBodyIncludes(createRules);

const updateRules = ["username", "password", "role", "active"];
export const validateUpdateUser = reqBodyExcludes(updateRules);

const updatePasswordRules = ["current", "new"];
export const validateUpdatePassword = reqBodyIncludes(updatePasswordRules);

const updatePreferencesRules = ["theme", "language"];
export const validateUpdatePreferences = reqBodyIncludes(
  updatePreferencesRules
);

const checkUsernameRules = ["username"];
export const validateCheckUsername = reqBodyIncludes(checkUsernameRules);

const resetPasswordRules = ["password"];
export const validateResetPassword = reqBodyIncludes(resetPasswordRules);

const updateUserRoleRules = ["role"];
export const validateUpdateUserRole = reqBodyIncludes(updateUserRoleRules);

const setActiveStatusRules = ["active"];
export const validateSetActiveStatus = reqBodyIncludes(setActiveStatusRules);
