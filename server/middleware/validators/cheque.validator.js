import {
  reqBodyIncludes,
  reqBodyExcludes,
} from "../reqValidators.middleware.js";

const createRules = ["serial", "dueDate", "value"];
export const validateCreateCheque = reqBodyIncludes(createRules);
