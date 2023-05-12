// See <https://www.fastify.io/docs/latest/Guides/Testing/>
import { test, describe, after, before } from "node:test"
import assert from "node:assert/strict"

// Fastify app builder
import build from "../app.js"

// TODO
describe.skip("User routes on /user (via JWT authentication)", async () => {
  let app
  let jwtTokenUser1
  let jwtTokenAdmin
  before(async () => {
    app = await build()

    // http POST http://localhost:8000/auth/login username="user1" password="iloveu"
    // user1's credentials for further queries
    ;({ body: jwtTokenUser1 } = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: "user1", password: "iloveu" },
    }))

    // http POST http://localhost:8000/auth/login username="admin" password="admin"
    // admin's credentials
    ;({ body: jwtTokenAdmin } = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: "admin", password: "admin" },
    }))
  })
  after(async () => {
    await app.close()
  })

  // http GET http://localhost:8000/user/user1
  test("GET /user/:username, unauthorized (authentication required)", async (ctxt) => {
    const response = await app.inject({
      method: "GET",
      url: "/user/user1",
    })
    assert.equal(response.statusCode, 401, "status 401")
  })

  // http GET http://localhost:8000/user/user1 Authorization:"Bearer eyJhb..."
  test("GET /user/:username, authorized (same user)", async (ctxt) => {
    const response = await app.inject({
      method: "GET",
      url: "/user/user1",
      headers: { authorization: `Bearer ${jwtTokenUser1}` },
    })
    assert.equal(response.statusCode, 200, "status 200")
    const content = response.json()
    assert.equal(content.username, "user1", "same username")
  })

  // http GET http://localhost:8000/user/user2 Authorization:"Bearer eyJhb..."
  test("GET /user/:username, forbidden (different user but NOT admin)", async (ctxt) => {
    const response = await app.inject({
      method: "GET",
      url: "/user/user2",
      headers: { authorization: `Bearer ${jwtTokenUser1}` },
    })
    assert.equal(response.statusCode, 403, "status 403")
  })

  // http GET http://localhost:8000/user/admin Authorization:"Bearer eyJhb..."
  test(
    "GET /user/:username, authorized (different user but admin)",
    { skip: false },
    async (ctxt) => {
      const response = await app.inject({
        method: "GET",
        url: "/user/user1",
        headers: { authorization: `Bearer ${jwtTokenAdmin}` },
      })
      assert.equal(response.statusCode, 200, "status 200")
    },
  )

  // http --auth user1:iloveu  POST http://localhost:8000/user email="toto@gmail.com" username=toto role=admin
  test("POST /user, forbbiden (not admin)", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "POST",
      url: "/user",
      body: { username: "user3", email: "user3@example.com", password: "user3", role: "normal" },
      headers: { authorization: `Bearer ${jwtTokenUser1}` },
    })
    assert.equal(response.statusCode, 403, "status 403")
  })

  // http --auth admin:admin  POST http://localhost:8000/user username=user3 email="user3@gmail.com" password=user3 role=normal
  test("POST /user, user3 created (admin)", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "POST",
      url: "/user",
      body: { username: "user3", email: "user3@example.com", password: "user3", role: "normal" },
      headers: { authorization: `Bearer ${jwtTokenAdmin}` },
    })
    assert.equal(response.statusCode, 201, "status 201")
  })

  test("POST /user, conflict (user3 already exists)", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "POST",
      url: "/user",
      body: { username: "user3", email: "user3@example.com", password: "user3", role: "normal" },
      headers: { authorization: `Bearer ${jwtTokenAdmin}` },
    })
    assert.equal(response.statusCode, 409, "status 409")
  })

  test("GET /user/user3, authorized (new user can authenticate)", { skip: false }, async (ctxt) => {
    const { body: jwtTokenUser3 } = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: "user3", password: "user3" },
    })

    const response = await app.inject({
      method: "GET",
      url: "/user/user3",

      headers: { authorization: `Bearer ${jwtTokenUser3}` },
    })
    assert.equal(response.statusCode, 200, "status 200")
  })

  // http --auth user1:iloveu DELETE http://localhost:8000/user/user3
  test("DELETE /user/user3, forbbiden (not admin)", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "DELETE",
      url: "/user/user3",
      headers: { authorization: `Bearer ${jwtTokenUser1}` },
    })
    assert.equal(response.statusCode, 403, "status 403")
  })

  // http --auth admin:admin DELETE http://localhost:8000/user/user3
  test("DELETE /user/user3, deleted (admin)", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "DELETE",
      url: "/user/user3",
      headers: { authorization: `Bearer ${jwtTokenAdmin}` },
    })
    assert.equal(response.statusCode, 200, "status 200")
  })
})
