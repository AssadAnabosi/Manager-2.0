import {
  reqBodyIncludes,
  reqBodyExcludes,
} from "../reqValidators.middleware.js";

const createRules = ["date", "worker", "isAbsent"];
export const validateCreateLog = reqBodyIncludes(createRules);

const updateRules = ["date", "worker"];
export const validateUpdateLog = reqBodyExcludes(updateRules);
