import { postEncryptSchema, postDecryptSchema } from "./schemas.js"
import { postEncryptHandler, postDecryptHandler, checkKeyExists } from "./handlers.js"

const postEncryptOptions = {
  method: "POST",
  path: "/encrypt",
  schema: postEncryptSchema,
  handler: postEncryptHandler,
}

const postDecryptOptions = {
  method: "POST",
  path: "/decrypt",
  schema: postDecryptSchema,
  handler: postDecryptHandler,
}

async function keyRoutes(fastify, options, done) {
  fastify.addHook("onRequest", fastify.auth([fastify.verifyJWTToken, fastify.basicAuth]))
  fastify.addHook("preHandler", checkKeyExists)
  fastify.route(postEncryptOptions)
  fastify.route(postDecryptOptions)
  done()
}

export default keyRoutes
