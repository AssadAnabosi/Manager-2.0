import { Types } from "mongoose";

const ObjectID = (id) => Types.ObjectId.createFromHexString(id);

export default ObjectID;
