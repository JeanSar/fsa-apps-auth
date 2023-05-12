// Read the .env file ASAP, used for PG env variables, <https://github.com/motdotla/dotenv>
import "dotenv/config"
// Main node object
import process from "node:process"

// Require the framework <https://www.fastify.io/>
import fastify from "fastify"
// Utilities, notably httpErrors <https://github.com/fastify/fastify-sensible>
import fastifySensible from "@fastify/sensible"
// Wrapper for node-postgres <https://github.com/fastify/fastify-postgres> https://node-postgres.com/
import pg from "@fastify/postgres"
// Authentication wrapper <https://github.com/fastify/fastify-auth>
import fastifyAuth from "@fastify/auth"
// HTTP Basic Auth, <https://github.com/fastify/fastify-basic-auth>
import fastifyBasicAuth from "@fastify/basic-auth"
// OAuth2 plugin <https://github.com/fastify/fastify-oauth2>
// import fastifyOauth2 from "@fastify/oauth2"
// Swagger generator <https://github.com/fastify/fastify-swagger
import fastifySwagger from "@fastify/swagger"
// Swagger UI <https://github.com/fastify/fastify-swagger-ui
import fastifySwaggerUI from "@fastify/swagger-ui"

// Print all routes, for dev <https://github.com/ShogunPanda/fastify-print-routes>
// eslint-disable-next-line import/no-unresolved, node/no-missing-import, node/no-unpublished-import
import fastifyPrintRoutes from "fastify-print-routes"

// Auth handler, to decorate app
import { verifyJWTToken, verifyLoginPassword } from "./auth/handlers.js"

// App's route
import authRoutes from "./auth/routes.js"
import healthRoutes from "./health/routes.js"
import userRoutes from "./user/routes.js"
import keyRoutes from "./key/routes.js"
import cryptRoutes from "./crypt/routes.js"

const serverUrl = `http://${process.env.HOSTNAME}:${process.env.PORT}`

const swaggerOptions = {
  // openapi: "3.0.3", generated
  info: {
    title: "TIWFSA Authentication App",
    version: "0.1.0",
    summary: "A sample encryption service",
    description: "Sample application for authentication lab in TIWFSA",
    contact: {
      name: "TIWFSA",
      url: serverUrl,
    },
  },

  servers: [
    {
      url: serverUrl,
      description: "Local server",
    },
  ],
  // host: `${process.env.HOSTNAME}:${process.env.PORT}`,
  // schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    { name: "health", description: "Health checks end-points" },
    { name: "user", description: "User end-points" },
    { name: "key", description: "Key management end-points" },
    { name: "auth", description: "Authentication end-points" },
    { name: "crypt", description: "Cryptography (encrypt/decrypt) end-points" },
  ],

  components: {
    securitySchemes: {
      jwtBearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Authorization header using the Bearer scheme.",
      },
      httpBasic: {
        type: "http",
        scheme: "basic",
        description: "Basic Authorization header with login/password.",
      },
      gitlabOAuth: {
        type: "oauth2",
        flows: {
          authorizationCode: {
            authorizationUrl: `${serverUrl}/auth/gitlab`,
            tokenUrl: `${serverUrl}/auth/callback`,
            scopes: {
              read_user: "Access to users's info",
            },
          },
        },
      },
    },
  },
  security: [
    {
      jwtBearer: [],
    },
    {
      httpBasic: [],
    },
  ],
}

const swaggerUIOptions = {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
  },
  initOAuth: {
    clientId: process.env.OAUTH2_CLIENT_ID_GITLAB,
    clientSecret: process.env.OAUTH2_CLIENT_SECRET_GITLAB,
    scopes: "read_user",
  },
}

// App builder see <https://www.fastify.io/docs/latest/Guides/Testing/>
async function build(options = {}) {
  // Instantiate Fastify with configured logger
  const app = fastify(options)

  // Automatic Swagger doc, BEFORE fastifyPrintRoutes
  app.register(fastifySwagger, { openapi: swaggerOptions })
  app.register(fastifySwaggerUI, swaggerUIOptions)

  // register now and prints all route when server is ready
  if (process.env.NODE_ENV == "development") {
    app.register(fastifyPrintRoutes, { compact: true })
  }

  // Register plugins
  app.register(fastifySensible)
  app.register(pg, {
    // connectionString is replaced by env variables
    native: process.platform === "linux",
    max: 4,
    connectionTimeoutMillis: 3000,
  })


  // Decorate fastify with authentication and authorization logic
  app.register(fastifyAuth)
  // TODO : compléter la fonction verifyJWTToken
  app.decorate("verifyJWTToken", verifyJWTToken)

  app.register(fastifyBasicAuth, {
    // TODO : compléter la fonction verifyLoginPassword
    validate: verifyLoginPassword,
    authenticate: false, 
  })

  // TODO : configurer l'authentification OAuth sur la forge
  // app.register(fastifyOauth2, {
  //   name: "OAuth2",
  //   credentials: {
  //     auth: {
  //       authorizeHost: "https://forge.univ-lyon1.fr",
  //       authorizePath: "/oauth/authorize",
  //       tokenHost: "https://forge.univ-lyon1.fr",
  //       tokenPath: "/oauth/token",
  //     },
  //   },
  //   schema: {
  //     tags: ["auth"],
  //     summary: "Principal (redirect) route for OAuth2",
  //     description: "GitLab OAuth2 (w/ or w/o OIDC) authentication, redirects to provider.",
  //   },
  // })

  // Register applicative routes
  app.register(authRoutes, { prefix: "/auth" })
  app.register(healthRoutes, { prefix: "/health" })
  app.register(userRoutes, { prefix: "/user" })
  app.register(keyRoutes, { prefix: "/key" })
  app.register(cryptRoutes, { prefix: "/crypt" })

  return app
}

export default build
