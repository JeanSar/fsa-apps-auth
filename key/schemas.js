const getKeySchema = {
  tags: ["key"],
  summary: "Get keys of current (logged) user",
  description: "Returns all keys pertaining to a user.",
  params: {
    username: { type: "string", minLength: 3 },
  },
  response: {
    200: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
}

const postKeySchema = {
  tags: ["key"],
  summary: "Create a new key for current (logged) user",
  description: "Returns the key added to database if any.",
  body: {
    type: "object",
    required: ["keyname"],
    properties: {
      keyname: { type: "string" },
    },
  },
  response: {
    "2xx": { type: "string" },
  },
}

export { getKeySchema, postKeySchema }
