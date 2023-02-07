import {
  reqBodyIncludes,
  reqBodyExcludes,
} from "../reqValidators.middleware.js";

const createRules = ["username", "password", "firstName", "lastName"];
export const validateRegisterUser = reqBodyIncludes(createRules);

const updateRules = ["username", "password", "accessLevel", "active", "logs"];
export const validateUpdateUser = reqBodyExcludes(updateRules);

const changePasswordRules = ["currentPassword", "newPassword"];
export const validateChangePassword = reqBodyIncludes(changePasswordRules);

const checkUsernameRules = ["username"];
export const validateCheckUsername = reqBodyIncludes(checkUsernameRules);

const resetPasswordRules = ["password"];
export const validateResetPassword = reqBodyIncludes(resetPasswordRules);

const setAccessLevelRules = ["accessLevel"];
export const validateSetAccessLevel = reqBodyIncludes(setAccessLevelRules);

const setActiveStatusRules = ["active"];
export const validateSetActiveStatus = reqBodyIncludes(setActiveStatusRules);
