import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

const algorithm = "Ici l'algo choisi pour le chiffrement"

async function checkKeyExists(request, reply) {
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
  request.key = Buffer.from(bytes, "hex")
}

// TODO : compléter
async function postEncryptHandler(request, reply) {
  const { content } = request.body
  const iv = randomBytes(16)
  reply.send({ content, iv: iv.toString("hex") })
}

// TODO : compléter
async function postDecryptHandler(request, reply) {
  const { content, iv } = request.body
  reply.send(content)
}
export { postEncryptHandler, postDecryptHandler, checkKeyExists }
