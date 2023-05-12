import { getKeySchema, postKeySchema } from "./schemas.js"
import { getKeyHandler, postKeyHandler } from "./handlers.js"

const getKeyOptions = {
  method: "GET",
  path: "/:username",
  schema: getKeySchema,
  preHandler: (request, reply, done) => done(),
  handler: getKeyHandler,
}

const postKeyOptions = {
  method: "POST",
  path: "",
  schema: postKeySchema,
  handler: postKeyHandler,
}

async function keyRoutes(fastify, options, done) {
  fastify.addHook("onRequest", fastify.auth([fastify.verifyJWTToken, fastify.basicAuth]))
  fastify.route(getKeyOptions)
  fastify.route(postKeyOptions)
  done()
}

export default keyRoutes
