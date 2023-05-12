// Import test library
// See <https://www.fastify.io/docs/latest/Guides/Testing/>
// See <https://node-tap.org/docs>
import { test } from "tap"

// Fastify app builder
import build from "../app.js"

test("post routes", { skip: true }, async (t) => {
  const app = build()
  // les sous-tests sont séquentiels si on utilise bien le contexte courant "t"
  t.teardown(async () => {
    // console.debug("main-teardown")
    await app.close()
  })

  let postIds
  // http GET http://localhost:8000/post
  t.test("GET all posts", async (t) => {
    // t.teardown(() => console.debug("get-OK"))
    const response = await app.inject({
      method: "GET",
      url: "/post",
    })
    t.equal(response.statusCode, 200, "status 200")
    t.type(response.json(), Array, "response-type Array")
    postIds = response.json().map((x) => x.id)
    t.end()
  })

  // http GET http://localhost:8000/post/0
  t.test("GET a non existent post", async (t) => {
    // t.teardown(() => console.debug("get-KO"))
    const response = await app.inject({
      method: "GET",
      url: "/post/0",
    })
    t.equal(response.statusCode, 404, "status 404")
    t.end()
  })

  t.test("GET an existent post", async (t) => {
    const response = await app.inject({
      method: "GET",
      url: `/post/${postIds[0]}`,
    })
    t.equal(response.statusCode, 200, "status 200")
    t.equal(response.json().id, postIds[0], "same id")
    // t.same(response.json(), { id: 1, title: "Post #1", body: "This is post one" }, "same content")
    t.end()
  })

  let newPostId
  // http POST http://localhost:8000/post/ title="New post title" body="New post body"
  t.test("POST a new post", async (t) => {
    const content = { title: "New post title", body: "New post body" }
    const response = await app.inject({
      method: "POST",
      url: "/post/",
      payload: content,
    })
    t.equal(response.statusCode, 201, "HTTP status")
    const body = response.json()
    t.equal(body.title, content.title, "same title")
    t.equal(body.body, content.body, "same body")
    t.type(body.id, "number", "id (generated)")
    newPostId = body.id
    t.end()
  })

  // http DELETE http://localhost:8000/post/4
  t.test("DELETE an existent post", async (t) => {
    const response = await app.inject({
      method: "DELETE",
      url: `/post/${newPostId}`,
    })
    t.equal(response.statusCode, 200, "status200")
    const body = response.json()
    t.equal(body.id, newPostId, "same id")
    t.end()
  })

  t.end()
  // console.debug("main-end")
})
