const user = {
  type: "object",
  required: ["username", "email"],
  properties: {
    username: {
      description: "Username, primary key",
      type: "string",
    },
    email: {
      description: "User's email, unique",
      type: "string",
      format: "email",
    },
  },
}

const getUserSchema = {
  tags: ["user"],
  summary: "User's information",
  description: "Retreives a user' information.",
  params: {
    username: { type: "string", minLength: 3 },
  },
  response: {
    "2xx": user,
  },
}

const delUserSchema = {
  tags: ["user"],
  summary: "Delete a user",
  description: "Delete a user. Administrators only.",
  params: {
    username: { type: "string", minLength: 3 },
  },
  response: {
    "2xx": user,
  },
}

const postUserSchema = {
  tags: ["user"],
  summary: "Create a new user",
  description: "Creates a new user. Administrators only.",
  body: {
    type: "object",
    required: ["username"],
    properties: {
      username: { type: "string", minLength: 3 },
      email: {
        type: "string",
        format: "email",
      },
      password: { type: "string" },
      role: { type: "string" },
    },
  },
  response: {
    "2xx": user,
  },
}

export { getUserSchema, postUserSchema, delUserSchema }
