import { getHealthSchema } from "./schemas.js"
import { getHealthHandler } from "./handlers.js"

const getHealthOptions = {
  method: "GET",
  path: "",
  schema: getHealthSchema,
  handler: getHealthHandler,
}

// the same, authenticated
const getAuthenticatedHealthOptions = {
  method: "GET",
  path: "/auth",
  schema: getHealthSchema,
  handler: getHealthHandler,
}

async function publicRoutes(fastify, options, done) {
  fastify.route(getHealthOptions)
  done()
}

// NOTE : auth should be managed at coarser grain to avoid code duplication
async function authenticatedRoutes(fastify, options, done) {
  // onRequest has not the body payload parsed, the preHandler has it
  // https://www.fastify.io/docs/latest/Reference/Lifecycle/#lifecycle
  // See https://github.com/fastify/fastify-auth#security-considerations
  fastify.addHook("onRequest", fastify.auth([fastify.verifyJWTToken, fastify.basicAuth]))
  // all the following routes are authenticated
  fastify.route(getAuthenticatedHealthOptions)
  done()
}

async function healthRoutes(fastify, options, done) {
  fastify.register(publicRoutes)
  fastify.register(authenticatedRoutes)
  done()
}

export default healthRoutes
