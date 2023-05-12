import { postAuthLoginSchema, oauthCallbackSchema } from "./schemas.js"
import { postAuthLoginHandler, oauthCallbackHandler } from "./handlers.js"

const loginOptions = {
  method: "POST",
  path: "/login",
  schema: postAuthLoginSchema,
  handler: postAuthLoginHandler,
}

const oauthCallbackOptions = {
  method: "GET",
  path: "/callback",
  schema: oauthCallbackSchema,
  handler: oauthCallbackHandler,
}

const authRoutes = (fastify, options, done) => {
  fastify.route(loginOptions)
  fastify.route(oauthCallbackOptions)
  done()
}

export default authRoutes
