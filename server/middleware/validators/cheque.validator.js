import {
    reqBodyIncludes,
    reqBodyExcludes,
} from "../reqValidators.middleware.js";

const createRules = ["serial", "dueDate", "value"];
export const validateCreateCheque = reqBodyIncludes(createRules);

const updateRules = ["serial"];
export const validateUpdateCheque = reqBodyExcludes(updateRules);