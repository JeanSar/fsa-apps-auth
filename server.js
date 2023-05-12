// Read the .env file ASAP
import "dotenv/config"
// Import fastify app
import build from "./app.js"

// HTTP config from dotenv
const port = process.env.PORT ?? 3000
const host = process.env.HOST ?? "127.0.0.1"

// Global target in {production, development, test}
const environment = process.env.NODE_ENV ?? "development"

const loggerOptions = new Map([
  // pretty logs for dev
  [
    "development",
    {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    },
  ],
  // default log
  ["production", true],
  // no log for tests
  ["test", false],
])

const app = await build({ logger: loggerOptions.get(environment) ?? true })

// Entry point
async function startServer() {
  try {
    await app.listen({ port, host })
    const status = await app.pg.query(
      "SELECT  current_catalog , current_user, inet_server_addr(), inet_server_port();",
    )

    const { current_catalog, current_user, inet_server_addr, inet_server_port } = status.rows[0]
    app.log.info(
      `Connected to postgres://${current_user}@${inet_server_addr}:${inet_server_port}/${current_catalog}`,
    )
  } catch (error) {
    app.log.fatal(error)
    // crashes the app
    // eslint-disable-next-line no-process-exit, unicorn/no-process-exit
    process.exit(1)
  }
}

await startServer()
