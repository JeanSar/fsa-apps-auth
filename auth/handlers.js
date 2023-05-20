// at the beginning of the file, import jwt and assign to a variable
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

// convert secret in hex string to bytes
const secret = Buffer.from(process.env.JWT_SECRET, "hex")

// helper
function generateJWTToken(username, role) {
  if(!username || !role) {
    throw new Error("generateJWTToken: Invalid parameter")
  }
  try {
    const token = jwt.sign(
      { 
        sub: username, 
        role: role, 
        iat: Math.floor(Date.now() / 1000)  + (60 * 60)
      }, 
      secret
    )
    return token
  } catch (error) {
    console.log(error)
    throw new Error("generateJWTToken: Error while generating JWT token")
  }

}

// set user's info once authenticated, user by verify{JWTToken, LoginPassword} functions
function setRequestUser(username, role, request) {
  request.server.log.info(`setRequestUser(${username}, ${role})`)
  // pass in the user's info
  request.user = { username, role, isAdmin: role === "admin" }
}

// Handler used by fastify.auth, decorates fastify instance
async function verifyJWTToken(request, reply) {
  request.server.log.info("verifyJWTToken")
  if (!request.raw.headers.authorization) {
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(401).send(new Error(`No JWT token provided`))
  }
  try {
    const auth = request.raw.headers.authorization
    const token = auth.split(' ')[1]
    request.server.log.info("Parsing JWT : " + token)
    const decoded = jwt.verify(token, secret)
    request.server.log.info(decoded)
    setRequestUser(decoded.sub, decoded.role, request)
  } catch(error) {
    request.server.log.error(error)
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(401).send(new Error(`Unable to process JWT token`))
  }
}

// intermediate function : DO NOT reply JWT. Used by postAuthLoginHandler and "@fastify/basic-auth"
async function verifyLoginPassword(username, password, request, reply) {
  request.server.log.info(verifyLoginPassword)
  request.server.log.info(`check if user ${username} exists with password ${password}`)
  if(!username || !password) {
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(401).send(new Error(`Username or password is missing`))
  }
  try {
    // seems okay to prevent sql injection attack https://stackoverflow.com/questions/58174695/prevent-sql-injection-with-nodejs-and-postgres
    const results = await request.server.pg.query(
      "SELECT role, password FROM account WHERE username = $1",
      [username]
    )
    console.log(results)
    if (results.rowCount == 1) {
      if( await bcrypt.compare(password, results.rows[0].password)) {
        const role = results.rows[0].role
        setRequestUser(username, role, request)
      } else {
        reply.headers({
          'content-type': 'application/json; charset=utf-8'
        })
        return reply.code(401).send(new Error(`Incorrect password`))
      }
    } else {
      reply.headers({
        'content-type': 'application/json; charset=utf-8'
      })
      return reply.code(401).send(new Error(`Username not found`))
    }
  } catch (error) {
    request.server.log.error(error)
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(401).send(new Error(`Unable to retrieve to retrieve login/password`))
  }
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
  request.server.log.info("postAuthLoginHandler")
  if(!request.body.username || !request.body.password) {
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(401).send(new Error(`Username or password is missing`))
  }
  try  {
    const username = request.body.username
    const password = request.body.password
    await verifyLoginPassword(username, password, request, reply)
    const jwtToken = generateJWTToken(request.user.username, request.user.role)
    reply.code(200).send(jwtToken)

  } catch(error) {
    request.server.log.error(error)
    reply.headers({
      'content-type': 'application/json; charset=utf-8'
    })
    return reply.code(500).send(new Error(`Server Error`))
  }
}

export {
  generateJWTToken,
  verifyJWTToken,
  verifyLoginPassword,
  oauthCallbackHandler,
  postAuthLoginHandler,
}
