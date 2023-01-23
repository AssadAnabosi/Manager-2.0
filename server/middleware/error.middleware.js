import ResponseError from "../utils/responseError.js";
import capitalizeFirstLetter from "../utils/capitalizeFirstLetter.js";
const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    console.log(`Error Occurred`);
    console.log(err);
    console.log(`---~~~---`);

    if (err.code === 11000) {
        let message;
        switch (Object.keys(err.keyPattern)[0]) {
            case "email":
                message = "Email is already registered";
                break;
            case "username":
                message = "Username is already taken";
                break;
            default:
                message = `${capitalizeFirstLetter(Object.keys(err.keyPattern)[0])} already exists`;
                break;
        }
        error = new ResponseError(message, 409);
    }

    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((val) => val.message);
        error = new ResponseError(message, 400);
    }

    return res
        .status(error.statusCode || 500)
        .json({
            success: false,
            error: error.message || "Server Error"
        });
}

export default errorHandler;
