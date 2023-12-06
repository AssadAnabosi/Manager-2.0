import { Types } from "mongoose";

const IsValidId = (id) => Types.ObjectId.isValid(id);

export default IsValidId;
