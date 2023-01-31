import {
    reqBodyIncludes,
    reqBodyExcludes,
} from "../reqValidators.middleware.js";

const loginRules = ["username", "password"];
export const validateLogin = reqBodyIncludes(loginRules);