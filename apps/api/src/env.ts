export type Env = {
  DB: D1Database;
  ENVIRONMENT: string;
  API_PREFIX?: string;
  API_DOCS?: string;
  BENCH?: string;
  JWT_ISSUER: string;
  JWT_ACCESS_EXPIRE?: string;
  REFRESH_MAX_AGE?: string;
  ALLOWED_ORIGINS: string;
  PBKDF2_ITERATIONS: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  PASSWORD_PEPPER: string;
  PASSWORD_PEPPER_VERSION: string;
  // Retired pepper versions kept so old hashes still verify: PASSWORD_PEPPER_<version>
  [retiredPepper: `PASSWORD_PEPPER_${number}`]: string | undefined;
};
