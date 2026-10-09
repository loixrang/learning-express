import "dotenv/config"
import {defineConfig} from "drizzle-kit"

const migrationUrl = process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error("Direct URL is missing")
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: migrationUrl
  }
})