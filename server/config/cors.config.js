export const allowedOrigins = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: "GET,POST,PUT,PATCH,DELETE",
};

export default corsOptions;
