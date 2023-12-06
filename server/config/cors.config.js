export const allowedOrigins = [process.env.CLIENT_URL.split(" ")];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: "GET,POST,PUT,PATCH,DELETE",
};

export default corsOptions;
