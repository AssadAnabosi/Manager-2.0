import ResponseError from "../utils/ResponseError.js";
import { Types } from "mongoose";
import capitalizeFirstLetter from "../utils/capitalizeFirstLetter.js";
const { ObjectId } = Types;

export const reqBodyIncludes = (rules) => {
  return function validateBody(req, res, next) {
    rules = typeof rules === "string" ? [rules] : rules;
    for (const rule of rules) {
      if (!req.body[rule]) {
        return next(
          new ResponseError(
            `Please provide ${rule} in your request's body`,
            400
          )
        );
      }
    }
    return next();
  };
};

export const reqBodyExcludes = (rules) => {
  rules = typeof rules === "string" ? [rules] : rules;
  return function validateBody(req, res, next) {
    for (const rule of rules) {
      if (req.body[rule] !== undefined) {
        return next(
          new ResponseError(
            `You are not authorized to update the ${rule} field`,
            400
          )
        );
      }
    }
    next();
  };
};

export const validateParamID = (params) => {
  params = typeof params === "string" ? [params] : params;
  return (req, res, next) => {
    for (let param of params) {
      if (!ObjectId.isValid(req.params[param])) {
        return next(
          new ResponseError(
            `Please provide a valid ${capitalizeFirstLetter(param)}`,
            400
          )
        );
      }
    }
    return next();
  };
};
