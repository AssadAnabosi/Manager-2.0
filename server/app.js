import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

import corsOptions from "./config/cors.config.js";
import errorHandler from "./middleware/error.middleware.js";
import credentials from "./middleware/allowCredentials.middleware.js";
import requestIP from "./middleware/reqIP.middleware.js";
import APIRoutes from "./routes/index.js";

const baseUrl = process.env.API_PREFIX || "/";
const app = new Hono();

app.use(poweredBy());
app.use(secureHeaders());
app.use(credentials);
app.use(cors(corsOptions));
app.use(csrf({ origin: corsOptions.origin }));
app.use(requestIP);

// @desc    Serving API routes
app.route(baseUrl, APIRoutes);

app.onError(errorHandler);

export default app;
