import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

const algorithm = "aes-256-ctr"

async function checkKeyExists(request, reply) {
  request.server.log.info("checkKeyExists")
  try {
    const { username } = request.user
    const { keyname } = request.body
    request.server.log.info(`check if key ${keyname} exists for ${username}`)

    const results = await request.server.pg.query(
      "SELECT bytes FROM private_key WHERE username = $1 AND keyname = $2;",
      [username, keyname],
    )
    
    if (results.rowCount !== 1) {
      return reply.notFound(`No such key ${keyname} for ${username}`)
    }
    const { bytes } = results.rows[0]
    request.key = Buffer.from(bytes, 'hex')
  } catch (error) {
    request.server.log.error(error)
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(500).send(new Error(`Server Error`))
  }
}

async function postEncryptHandler(request, reply) {
  request.server.log.info("postEncryptHandler")
  if(!request.body.content) {
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(400).send(new Error(`Body content is missing`))
  }
  try {
    request.server.log.info(request.body)
    const { content } = request.body
    request.server.log.info(content)
    const iv = randomBytes(16)
    const cipher = createCipheriv(algorithm, request.key, iv);
    let encrypted = cipher.update(content, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    reply.send({ content: encrypted, iv: iv.toString('hex') })
  } catch(error) {
    request.server.log.error(error)
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(500).send(new Error(`Server Error`))
  }
}

async function postDecryptHandler(request, reply) {
  request.server.log.info("postDecryptHandler")
  if(!request.body.content || !request.body.iv) {
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(400).send(new Error(`Body content or iv is missing`))
  }
  try {
    request.server.log.info(request.body)
    const {content, iv} = request.body
    const decipher = createDecipheriv(algorithm, request.key, Buffer.from(iv, "hex"))
    let decrypted = decipher.update(content, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    reply.send(decrypted)
  } catch(error) {
    console.log(error)
    request.server.log.error(error)
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(500).send(error)
  }
}
export { postEncryptHandler, postDecryptHandler, checkKeyExists }
