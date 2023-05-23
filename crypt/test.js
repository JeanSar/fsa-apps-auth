// See <https://www.fastify.io/docs/latest/Guides/Testing/>
import { test, describe, after, before } from "node:test"
import assert from "node:assert/strict"

// Fastify app builder
import build from "../app.js"

describe("Crypt routes", async () => {
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

  let encrypted
  let iv
  const message = "Attack@Down 🔫"
  // http --auth user1:iloveu POST http://localhost:8000/crypt/encrypt keyname=key1 content="Attack@Down 🔫"
  test("POST /crypt/encrypt, ", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "POST",
      url: "/crypt/encrypt",
      body: { keyname: "key1", content: message },
      headers: { authorization: `Bearer ${jwtTokenUser1}` },
    })
    assert.equal(response.statusCode, 200, "status 200")
    ;({ content: encrypted, iv } = await response.json())
    assert.ok(typeof encrypted === "string", "string type")
    assert.ok(typeof iv === "string", "string type")
  })

  // http --auth user1:iloveu POST http://localhost:8000/crypt/decrypt keyname=key1 content=346607145ab6eae68c78a409cc3abe484b97ea iv=d91584a10da0c04fabef6bcc6ca7001a
  test("POST /crypt/decrypt, ", { skip: false }, async (ctxt) => {
    const response = await app.inject({
      method: "POST",
      url: "/crypt/decrypt",
      body: { keyname: "key1", content: encrypted, iv },
      headers: { authorization: `Bearer ${jwtTokenUser1}` },
    })
    assert.equal(response.statusCode, 200, "status 200")
    assert.equal(response.body, message, "original message")
  })
})
