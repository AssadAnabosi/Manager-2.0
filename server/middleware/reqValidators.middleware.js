import { createMiddleware } from "hono/factory";
import ResponseError from "../utils/responseError.js";
import { Types } from "mongoose";
import * as statusCode from "../utils/constants/statusCodes.js";
const { ObjectId } = Types;
import * as DB from "../models/index.js";
import capitalizeFirstLetter from "../utils/capitalizeFirstLetter.js";

export const reqBodyIncludes = (rules) => {
  return createMiddleware(async (c, next) => {
    const body = await c.req.json();
    rules = typeof rules === "string" ? [rules] : rules;
    for (const rule of rules) {
      if (typeof body[rule] === "undefined") {
        throw new ResponseError(
          `Please provide ${rule} in your request's body`,
          statusCode.BAD_REQUEST
        );
      }
    }
    await next();
  });
};

export const reqBodyExcludes = (rules) => {
  return createMiddleware(async (c, next) => {
    const body = await c.req.json();
    rules = typeof rules === "string" ? [rules] : rules;
    for (const rule of rules) {
      if (typeof body[rule] !== "undefined") {
        throw new ResponseError(
          `Please provide ${rule} in your request's body`,
          statusCode.BAD_REQUEST
        );
      }
    }
    await next();
  });
};

export const validateParamID = (params) => {
  params = typeof params === "string" ? [params] : params;
  return createMiddleware(async (c, next) => {
    for (let param of params) {
      if (!ObjectId.isValid(c.req.param(param))) {
        throw new ResponseError(
          `Please provide a valid ${capitalizeFirstLetter(param)}`,
          statusCode.BAD_REQUEST
        );
      }
      const model = paramToModel(param);
      let document = await DB[model].findById(c.req.param(param));
      if (!document) {
        throw new ResponseError(
          `${model} With ID [${c.req.param(param)}] Is Not Found`,
          statusCode.NOT_FOUND
        );
      }
      c.set(model, document);
    }
    await next();
  });
};

const paramToModel = (param) => {
  return capitalizeFirstLetter(param.slice(0, param.length - 2));
};
