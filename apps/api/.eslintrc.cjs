module.exports = {
  root: true,
  env: { es2022: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["migrations", ".wrangler", "node_modules"],
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
};
