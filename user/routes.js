import { getUserSchema, postUserSchema, delUserSchema } from "./schemas.js"
import { getUserHandler, postUserHandler, delUserHandler } from "./handlers.js"

const getUserOptions = {
  method: "GET",
  path: "/:username",
  schema: getUserSchema,
  // Authorization logic
  preHandler: (request, reply, done) => done(),
  // Business logic
  handler: getUserHandler,
}

const postUserOptions = {
  method: "POST",
  path: "",
  schema: postUserSchema,
  // Authorization logic
  preHandler: (request, reply, done) => done(),
  // Business logic
  handler: postUserHandler,
}

const delUserOptions = {
  method: "DELETE",
  path: "/:username",
  schema: delUserSchema,
  // Authorization logic
  preHandler: (request, reply, done) => done(),
  // Business logic
  handler: delUserHandler,
}

async function usersRoutes(fastify, options, done) {
  fastify.addHook("onRequest", fastify.auth([fastify.verifyJWTToken, fastify.basicAuth]))
  fastify.route(getUserOptions)
  fastify.route(postUserOptions)
  fastify.route(delUserOptions)
  done()
}

export default usersRoutes
