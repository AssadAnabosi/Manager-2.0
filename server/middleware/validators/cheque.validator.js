import {
  reqBodyIncludes,
  reqBodyExcludes,
} from "../reqValidators.middleware.js";

const createRules = ["serial", "dueDate", "value", "isCancelled"];
export const validateCreateCheque = reqBodyIncludes(createRules);
