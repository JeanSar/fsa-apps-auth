import { getPostsSchema, getPostSchema, addPostSchema, deletePostSchema } from "./schemas.js"

import { getPostsHandler, getPostHandler, addPostHandler, deletePostHandler } from "./handlers.js"

// get all posts
const getPostsOptions = {
  method: "GET",
  path: "",
  schema: getPostsSchema,
  handler: getPostsHandler,
}

// get a post
const getPostOptions = {
  method: "GET",
  path: "/:id",
  schema: getPostSchema,
  handler: getPostHandler,
}

// create a new post
const addPostOptions = {
  method: "POST",
  path: "/",
  schema: addPostSchema,
  handler: addPostHandler,
}

// delete a post
const deletePostOptions = {
  method: "DELETE",
  path: "/:id",
  schema: deletePostSchema,
  handler: deletePostHandler,
}

// adds all routes
const postRoutes = (fastify, options, done) => {
  fastify.route(getPostsOptions)
  fastify.route(getPostOptions)
  fastify.route(addPostOptions)
  fastify.route(deletePostOptions)
  done()
}

export default postRoutes
