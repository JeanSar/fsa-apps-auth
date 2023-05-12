async function getHealthHandler(request, reply) {
  let ready
  try {
    const results = await request.server.pg.query("SELECT CURRENT_TIMESTAMP;")
    ready = results.rowCount !== 0
  } catch {
    // no crash if database is down
    ready = false
  }
  return reply.send({ ready })
}

export { getHealthHandler }
