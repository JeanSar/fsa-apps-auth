async function getPostsHandler(request, reply) {
  const results = await request.server.pg.query("SELECT * FROM post;")
  reply.send(results.rows)
}

async function getPostHandler(request, reply) {
  const { id } = request.params
  const results = await request.server.pg.query("SELECT * FROM post WHERE id = $1;", [id])

  if (!results.rowCount) {
    return reply.notFound(`Post #${id} not found`)
  }

  return reply.send(results.rows[0])
}

async function addPostHandler(request, reply) {
  const { title, body } = request.body
  const results = await request.server.pg.query(
    "INSERT INTO post(title, body) VALUES ($1, $2) RETURNING *;",
    [title, body],
  )

  if (results.rowCount !== 1) {
    return reply.internalServerError(`Post cannot be inserted`)
  }

  reply.status(201).send(results.rows[0])
}

async function deletePostHandler(request, reply) {
  const { id } = request.params

  const results = await request.server.pg.query("DELETE FROM post WHERE id = $1 RETURNING *;", [id])

  if (!results.rowCount) {
    return reply.notFound(`Post #${id} not found`)
  }

  return reply.send(results.rows[0])
}

export { getPostsHandler, getPostHandler, addPostHandler, deletePostHandler }
