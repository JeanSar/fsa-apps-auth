// See <https://www.fastify.io/docs/latest/Guides/Testing/>
import { test, describe, after, before } from "node:test"
import assert from "node:assert/strict"

// Fastify app builder
import build from "../app.js"

describe("Health routes on /health", async () => {
  let app
  before(async () => {
    app = await build()
  })
  after(async () => {
    await app.close()
  })

  // TODO : activer ce tests et le vérifier
  // http GET http://localhost:8000/health/auth
  test("GET /health/auth, unauthorized", { skip: true }, async (ctxt) => {
    const response = await app.inject({
      method: "GET",
      url: "/health/auth",
    })
    assert.equal(response.statusCode, 401, "status 401")
  })

  // http GET http://localhost:8000/health
  test("GET /health, public route", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    })
    assert.equal(response.statusCode, 200, "status 200")
    assert.equal(
      response.headers["content-type"],
      "application/json; charset=utf-8",
      "content-type application/json",
    )
    const body = response.json()
    assert.ok(body.ready)
    assert.equal(body.ready, true, "App is ready")
  })
})
