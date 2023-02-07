import {
  reqBodyIncludes,
  reqBodyExcludes,
} from "../reqValidators.middleware.js";

const createRules = ["name"];
export const validateCreatePayee = reqBodyIncludes(createRules);

const updateRules = ["cheques"];
export const validateUpdatePayee = reqBodyExcludes(updateRules);
