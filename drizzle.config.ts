import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "mysql",
  schema: "./models/drizzle-schema.ts",
  out: "./drizzle",

  dbCredentials: {
    url: "mysql://dataviz_user:mysecretpassword@localhost:3346/dataviz",
  }
});
