import bcrypt from 'bcrypt'
const saltRounds = 10

async function getUserHandler(request, reply) {
  request.server.log.info("getUserHandler")
  try {
    if (!request.params || !request.params.username) {
      reply.headers({
        'content-type': 'application/json; charset=utf-8'
      })
      return reply.code(400).send(new Error(`Parameter username is missing`))
    }
    const { username } = request.params
    if (!request.user.isAdmin && request.user.username !== username) {
      reply.headers({
        'content-type': 'application/json; charset=utf-8'
      })
      return reply.code(403).send(new Error('Forbidden'))
    }
    const results = await request.server.pg.query(
      "SELECT * FROM account WHERE username = $1;",
      [username]
    )
    return results.rowCount == 1 ? reply.send(results.rows[0]) : reply.notFound(`User '${username}' not found`);

  } catch (error) {
    request.server.log.error(error)
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(500).send(new Error("Server error"))
  }
}

async function postUserHandler(request, reply) {
  request.server.log.info("postUserHandler")
  try {
    if (!request.body.username
      || !request.body.email
      || !request.body.password
      || !request.body.role) {
      reply.headers({
        'content-type': 'application/json; charset=utf-8'
      })
      return reply.code(400).send(new Error("Parameters missing in request body"))
    }
    if(!request.user.isAdmin) {
      reply.headers({
        'content-type': 'application/json; charset=utf-8'
      })
      return reply.code(403).send(new Error('Forbidden'))
    }
    const { username, email, password, role } = request.body
    const roleWithDefault = role ?? "normal"

    const hashedPassword = await bcrypt.hash(password, saltRounds)

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
  } catch (error) {
    request.server.log.error(error)
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(500).send(new Error("Server error"))
  }
}

async function delUserHandler(request, reply) {
  request.server.log.info("delUserHandler")
  try {
    if (!request.params || !request.params.username) {
      reply.headers({
        'content-type': 'application/json; charset=utf-8'
      })
      return reply.code(400).send(new Error(`Parameter username is missing`))
    }
    if(!request.user.isAdmin) {
      reply.headers({
        'content-type': 'application/json; charset=utf-8'
      })
      return reply.code(403).send(new Error('Forbidden'))
    }
    const { username } = request.params

    const results = await request.server.pg.query(
      "DELETE FROM account WHERE username = $1 RETURNING *;",
      [username],
    )

    if (results.rowCount !== 1) {
      return reply.notFound(`User '${username}' not found`)
    }

    return reply.send(results.rows[0])
  } catch (error) {
    request.server.log.error(error)
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(500).send(new Error("Server error"))
  }
}

export { getUserHandler, postUserHandler, delUserHandler }
