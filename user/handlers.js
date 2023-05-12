async function getUserHandler(request, reply) {
  const { username } = request.params

  const results = await request.server.pg.query("SELECT * FROM account WHERE username = $1;", [
    username,
  ])

  if (!results.rowCount) {
    return reply.notFound(`User '${username}' not found`)
  }

  return reply.send(results.rows[0])
}

async function postUserHandler(request, reply) {
  const { username, email, password, role } = request.body
  const roleWithDefault = role ?? "normal"
  // TODO : hasher correctement
  const hashedPassword = password

  request.server.log.info(
    `post user ${username} (${email}) with password ${password} and role "${roleWithDefault}"]`,
  )
  request.server.log.info(`hashed password = ${hashedPassword}]`)

  const results = await request.server.pg.query(
    `INSERT INTO account(username, email, password, role)
     VALUES ($1, $2, $3, $4)
     -- conflict on either username or email)
     ON CONFLICT DO NOTHING
     RETURNING *;`,
    [username, email, hashedPassword, roleWithDefault],
  )

  if (results.rowCount !== 1) {
    return reply.conflict(`User ${username} or email ${email} already exists`)
  }

  reply.status(201).send(results.rows[0])
}

async function delUserHandler(request, reply) {
  const { username } = request.params

  const results = await request.server.pg.query(
    "DELETE FROM account WHERE username = $1 RETURNING *;",
    [username],
  )

  if (results.rowCount !== 1) {
    return reply.notFound(`User '${username}' not found`)
  }

  return reply.send(results.rows[0])
}

export { getUserHandler, postUserHandler, delUserHandler }
