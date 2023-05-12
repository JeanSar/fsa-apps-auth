const typeString = { type: "string" } // since i will be using this type a lot

const post = {
  type: "object",
  required: ["title", "body"],
  properties: {
    id: { type: "number" },
    title: typeString,
    body: typeString,
  },
}

const getPostsSchema = {
  response: {
    "2xx": {
      type: "array",
      items: post,
    },
  },
}

const getPostSchema = {
  params: {
    id: { type: "number" },
  },
  response: {
    "2xx": post,
  },
}

const addPostSchema = {
  body: {
    type: "object",
    required: ["title", "body"],
    properties: {
      title: typeString,
      body: typeString,
    },
  },
  response: {
    "2xx": post,
  },
}

const deletePostSchema = {
  params: {
    id: { type: "number" },
  },
  response: {
    "2xx": post,
  },
}

export { getPostsSchema, getPostSchema, addPostSchema, deletePostSchema }
