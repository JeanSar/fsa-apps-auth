import { randomBytes } from "node:crypto"

async function getKeyHandler(request, reply) {
  request.server.log.info("getKeyHandler")
  try {
    const { username } = request.params

    const results = await request.server.pg.query(
      "SELECT keyname FROM private_key WHERE username = $1;",
      [username],
    )
    return reply.send(results.rows.map((x) => x.keyname))
  }
  catch (error) {
    request.server.log.error(error)
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(500).send(new Error(`Unable to request user's keys`))
  }
}

async function postKeyHandler(request, reply) {
  request.server.log.info("postKeyHandler")
  try {
    const { username } = request.user
    const { keyname } = request.body
    const bytes = randomBytes(32).toString("hex")

    request.server.log.info(`post key ${keyname} from ${username} (${bytes})`)

    // or db side via gen_random_bytes(32)
    const results = await request.server.pg.query(
      `INSERT INTO private_key(username, keyname, bytes)
     VALUES ($1, $2, decode($3, 'hex'))
     -- ON CONFLICT (username, keyname) DO UPDATE SET bytes = decode($3, 'hex')
     ON CONFLICT DO NOTHING
     RETURNING keyname;`,
      [username, keyname, bytes],
    )

    if (results.rowCount !== 1) {
      return reply.conflict(`Key ${keyname} for ${username} already exists`)
    }

    reply.status(201).send(results.rows[0].keyname)
  } catch (error) {
    request.server.log.error(error)
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(500).send(new Error(`Server error`))
  }
}

export { getKeyHandler, postKeyHandler }
