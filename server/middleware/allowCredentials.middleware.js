import { allowedOrigins } from "../config/cors.config.js";

const allowCredentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Credentials", true);
    }

    next();
};

export default allowCredentials;