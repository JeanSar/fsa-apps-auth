// at the beginning of the file, import jwt and assign to a variable
import jwt from "jsonwebtoken"

// convert secret in hex string to bytes
const secret = Buffer.from(process.env.JWT_SECRET, "hex")

// helper
function generateJWTToken(username, role) {
  // TODO : compléter
  throw new Error("Not implemented")
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
  // setRequestUser(sub, role, request)
  throw new Error("Not implemented")
}

// intermediate function : DO NOT reply JWT. Used by postAuthLoginHandler and "@fastify/basic-auth"
async function verifyLoginPassword(username, password, request, reply) {
  // TODO : compléter
  // setRequestUser(username, role, request)
  throw new Error("Not implemented")
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


  // setRequestUser(username, role, request)
  // const jwtToken = generateJWTToken(username, role)
  // reply.send(jwtToken)
  reply.notImplemented()
}

// Route handler for login/password
async function postAuthLoginHandler(request, reply) {
    // TODO : compléter
  reply.notImplemented()
}

export {
  generateJWTToken,
  verifyJWTToken,
  verifyLoginPassword,
  oauthCallbackHandler,
  postAuthLoginHandler,
}
