import ResponseError from "../utils/responseError.js";
import { Types } from "mongoose";
import * as statusCode from "../utils/constants/statusCodes.js";
const { ObjectId } = Types;
import * as DB from "../models/index.js";
import capitalizeFirstLetter from "../utils/capitalizeFirstLetter.js";

export const reqBodyIncludes = (rules) => {
  return function validateBody(req, res, next) {
    rules = typeof rules === "string" ? [rules] : rules;
    for (const rule of rules) {
      if (typeof req.body[rule] === "undefined") {
        return next(
          new ResponseError(
            `Please provide ${rule} in your request's body`,
            statusCode.BAD_REQUEST
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
            statusCode.BAD_REQUEST
          )
        );
      }
    }
    next();
  };
};

export const validateParamID = (params) => {
  params = typeof params === "string" ? [params] : params;
  return async (req, res, next) => {
    for (let param of params) {
      if (!ObjectId.isValid(req.params[param])) {
        return next(
          new ResponseError(
            `Please provide a valid ${capitalizeFirstLetter(param)}`,
            statusCode.BAD_REQUEST
          )
        );
      }
      const model = paramToModel(param);
      let document = await DB[model].findById(req.params[param]);
      if (!document) {
        return next(
          new ResponseError(
            `${model} With ID [${req.params[param]}] Is Not Found`,
            statusCode.NOT_FOUND
          )
        );
      }
      req[model] = document;
    }
    return next();
  };
};

const paramToModel = (param) => {
  return capitalizeFirstLetter(param.slice(0, param.length - 2));
};
