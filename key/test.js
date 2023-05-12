// See <https://www.fastify.io/docs/latest/Guides/Testing/>
import { test, describe, after, before } from "node:test"
import assert from "node:assert/strict"

// Fastify app builder
import build from "../app.js"

describe.skip("Key routes", async () => {
  let app

  let jwtTokenUser1
  before(async () => {
    app = await build()
    // http POST http://localhost:8000/auth/login username="user1" password="iloveu"
    // user1's credentials for further queries
    ;({ body: jwtTokenUser1 } = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: "user1", password: "iloveu" },
    }))
  })
  after(async () => {
    await app.close()
  })

  // http --auth user1:iloveu http://localhost:8000/key/user1
  test("GET /key/user1, ", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "GET",
      url: "/key/user1",
      headers: { authorization: `Bearer ${jwtTokenUser1}` },
    })
    assert.equal(response.statusCode, 200, "status 200")
    const content = await response.json()
    assert.ok(Array.isArray(content), "array type")
    assert.ok(
      content.every((x) => typeof x === "string"),
      "keyname string",
    )
  })

  // http --auth user1:iloveu POST http://localhost:8000/key keyname=key3
  test("POST /key, created", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "POST",
      url: "/key",
      body: { keyname: "key3" },
      headers: { authorization: `Bearer ${jwtTokenUser1}` },
    })
    assert.equal(response.statusCode, 201, "status 201")
    assert.equal(response.body, "key3", "same id")
  })

  // http --auth user1:iloveu POST http://localhost:8000/key keyname=key3
  test("POST /key, already exists", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "POST",
      url: "/key",
      body: { keyname: "key3" },
      headers: { authorization: `Bearer ${jwtTokenUser1}` },
    })
    assert.equal(response.statusCode, 409, "status 409")

    // reset
    app.pg.query("DELETE FROM private_key WHERE username = $1 AND keyname = $2", ["user1", "key3"])
  })
})
