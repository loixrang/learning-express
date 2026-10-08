import "dotenv/config"
import { sql } from "drizzle-orm";
import app from "./app";
import { db } from "./db/client";

const port = Number(process.env.PORT ?? 5000)

async function startServer() {
  //check that postgreSQL is reachable before starting
  await db.execute(sql`SELECT 1`);
  console.log("Connected to postgreSQL")

  const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })

  server.on("error", (error) => {
    console.error("HTTP server failed:", error);
    process.exit(1)
  })
}

startServer().catch((error) => {
  console.error("Server startup failed", error);
  process.exit(1)
})
