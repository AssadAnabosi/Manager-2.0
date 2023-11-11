import { reqBodyIncludes } from "../reqValidators.middleware.js";

const createRules = ["date", "value", "description"];
export const validateCreateBill = reqBodyIncludes(createRules);
