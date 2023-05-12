// See <https://www.fastify.io/docs/latest/Guides/Testing/>
import { test, describe, after, before } from "node:test"
import assert from "node:assert/strict"

import jwt from "jsonwebtoken"

// Fastify app builder
import build from "../app.js"

const secret = Buffer.from(process.env.JWT_SECRET, "hex")

// TODO : activer ces tests et les vérifier
describe.skip("JWT authentication via login/password on /auth/login", async () => {
  let app
  before(async () => {
    app = await build()
  })
  after(async () => {
    await app.close()
  })

  // http POST http://localhost:8000/user/ username="user1" password="unknown"
  test("POST /auth/login, unauthorized (bad password)", async (ctxt) => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: "user1", password: "unknown" },
    })

    assert.equal(response.statusCode, 401, "status 401")
    assert.equal(
      response.headers["content-type"],
      "application/json; charset=utf-8",
      "content-type application/json",
    )
  })

  // http POST http://localhost:8000/user/ username="unknown" password="unknown"
  test("POST /auth/login, unauthorized (bad username)", async (ctxt) => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: "unknown", password: "unknown" },
    })
    assert.equal(response.statusCode, 401, "status 401")
    assert.equal(
      response.headers["content-type"],
      "application/json; charset=utf-8",
      "content-type application/json",
    )
  })

  // http POST http://localhost:8000/user/ username="user1" password="iloveu"
  test("POST /auth/login, authorized (receives JWT)", async (ctxt) => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: "user1", password: "iloveu" },
    })
    assert.equal(response.statusCode, 200, "status 200")
    assert.equal(
      response.headers["content-type"],
      "text/plain; charset=utf-8",
      "content-type text/plain",
    )
    const jwtToken = response.body
    const token = jwt.verify(jwtToken, secret)
    // t.hasProps(token, ["sub", "role", "iat", "exp"])
    assert.equal(token.sub, "user1", "same user 'user1'")
    assert.equal(token.role, "normal", "role 'normal'")
    assert.ok("iat")
    assert.ok("exp")
  })
})

describe("HTTP basic authentication on /health/auth", async () => {
  let app
  before(async () => {
    app = await build()
  })
  after(async () => {
    await app.close()
  })

  // TODO : activer ces tests et les vérifier
  // http GET http://localhost:8000/health/auth --auth user1:iloveu
  test("GET /health/auth, authorized", { skip: true }, async (ctxt) => {
    const user_pass = Buffer.from(`user1:iloveu`)
    const response = await app.inject({
      method: "GET",
      url: "/health/auth",
      headers: { authorization: `Basic ${user_pass.toString("base64")}` },
    })
    assert.equal(response.statusCode, 200, "status 200")
  })

  // http GET http://localhost:8000/health/auth --auth user1:unknown
  test("GET /health/auth, unauthorized (bad password)", { skip: false }, async (ctxt) => {
    const user_pass = Buffer.from(`user1:unknown`)
    const response = await app.inject({
      method: "GET",
      url: "/health/auth",
      headers: { authorization: `Basic ${user_pass.toString("base64")}` },
    })
    assert.equal(response.statusCode, 401, "status 401")
    assert.equal(
      response.headers["content-type"],
      "application/json; charset=utf-8",
      "content-type application/json",
    )
  })

  // http GET http://localhost:8000/health/auth --auth unknown:iloveu
  test("GET /health/auth, unauthorized (bad user)", { skip: false }, async (ctxt) => {
    const user_pass = Buffer.from(`unknown:unknown`)
    const response = await app.inject({
      method: "GET",
      url: "/health/auth",
      headers: { authorization: `Basic ${user_pass.toString("base64")}` },
    })
    assert.equal(response.statusCode, 401, "status 401")
    assert.equal(
      response.headers["content-type"],
      "application/json; charset=utf-8",
      "content-type application/json",
    )
  })
})

// TODO : activer ces tests et les vérifier
describe.skip("OAuth2 authentication on /auth/gitlab",  async () => {
  let app
  before(async () => {
    app = await build()
  })
  after(async () => {
    await app.close()
  })

  let state
  // http GET http://localhost:8000/auth/github
  test("GET /auth/gitlab, 302 redirect", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "GET",
      url: "/auth/gitlab",
    })
    assert.equal(response.statusCode, 302, "redirect")
    const redirectLocation = new URL(response.headers["location"])
    assert.equal(redirectLocation.origin, "https://forge.univ-lyon1.fr")
    const redirectParameters = redirectLocation.searchParams
    assert.ok(redirectParameters.get("response_type"))
    assert.ok(redirectParameters.get("client_id"))
    assert.ok(redirectParameters.get("scope"))
    assert.ok(redirectParameters.get("state"))
    state = redirectParameters.get("state")
    // TODO check if redirect_uri is OK
    assert.ok(redirectParameters.get("redirect_uri"))
  })

  // http GET http://localhost:8000/auth/callback code==toto state==362be5c766874067cdf3
  test("GET /auth/callback, OAuth callback", async (ctxt) => {
    const response = await app.inject({
      method: "GET",
      url: "/auth/callback",
      query: { code: "valid access code by OAuth provider", state },
    })
    assert.equal(response.statusCode, 401, "redirect with bad code")
  })
})
