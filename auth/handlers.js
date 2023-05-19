// at the beginning of the file, import jwt and assign to a variable
import jwt from "jsonwebtoken"

// convert secret in hex string to bytes
const secret = Buffer.from(process.env.JWT_SECRET, "hex")

// helper
function generateJWTToken(username, role) {
  // TODO : compléter
  const token = jwt.sign({ sub: username, role: role }, secret)
  return token
  //throw new Error("Not implemented")
}

// set user's info once authenticated, user by verify{JWTToken, LoginPassword} functions
function setRequestUser(username, role, request) {
  request.server.log.info(`setRequestUser(${username}, ${role})`)
  // pass in the user's info
  request.user = { username, role, isAdmin: role === "admin" }
}

// Handler used by fastify.auth, decorates fastify instance
async function verifyJWTToken(request, reply) {
  // TODO : compléter
  const auth = request.headers.authorization
  const token = auth.split(' ')[1]
  jwt.verify(token, secret, function(error, decoded) {
    console.log(decoded)
    console.log(error)
    setRequestUser(decoded.sub, decoded.role, request)
  });
}

// intermediate function : DO NOT reply JWT. Used by postAuthLoginHandler and "@fastify/basic-auth"
async function verifyLoginPassword(username, password, request, reply) {
  request.server.log.info(`check if user ${username} exists with password ${password}`)
  const results = await request.server.pg.query(
    "SELECT role FROM account WHERE username =  $1 and password = $2",
    [username, password]
  )
  if (results.rowCount !== 1) {
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(401).send(`No such user exists with provided password`)
  }
  const role = results.rows[0].role
  setRequestUser(username, role, request)
}

// Get user's information from Gitlab
async function fetchGitlabUserProfile(glAccessToken) {
  const options = {
    method: "GET",
    headers: new Headers({
      Accept: "application/json",
      Authorization: `Bearer ${glAccessToken}`,
    }),
  }

  const resultProfile = await fetch(`https://forge.univ-lyon1.fr/api/v4/user`, options)
  return await resultProfile.json()
}

// Get GitHub access token from authorization code, manual
async function oauthCallbackHandler(request, reply) {
  // TODO : compléter
  const { code: authorizationCode } = request.query
  request.server.log.info(`authorization code: ${authorizationCode}`)
  const profile = fetchGitlabUserProfile(authorizationCode)
  console.log(profile)
  const username = profile.username
  const role = profile.role
  setRequestUser(username, role, request)
  const jwtToken = generateJWTToken(username, role)
  reply.send(jwtToken)
}

// Route handler for login/password
async function postAuthLoginHandler(request, reply) {
  // TODO : compléter
  console.log(request.body)
  const username = request.body.username
  const password = request.body.password
  await verifyLoginPassword(username, password, request, reply)
  const jwtToken = generateJWTToken(request.user.username, request.user.role)
  reply.send(jwtToken)
}

export {
  generateJWTToken,
  verifyJWTToken,
  verifyLoginPassword,
  oauthCallbackHandler,
  postAuthLoginHandler,
}
