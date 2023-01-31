import ResponseError from "../utils/ResponseError.js";

export const reqBodyIncludes = (rules) => {
    return function validateBody(req, res, next) {
        rules = (typeof rules === 'string') ? [rules] : rules;
        for (const rule of rules) {
            if (!req.body[rule]) {
                return next(new ResponseError(`Please provide ${rule} in your request's body`, 400));
            }
        }
        return next();
    }
}

export const reqBodyExcludes = (rules) => {
    rules = (typeof rules === 'string') ? [rules] : rules;
    return function validateBody(req, res, next) {
        for (const rule of rules) {
            if (req.body[rule] !== undefined) {
                return next(new ResponseError(`You are not authorized to update the ${rule} field`, 400));
            }
        }
        next()
    }
}