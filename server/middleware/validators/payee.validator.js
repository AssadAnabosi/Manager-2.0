import { reqBodyIncludes } from "../reqValidators.middleware.js";

const createRules = ["name"];
export const validateCreatePayee = reqBodyIncludes(createRules);
