const getHealthSchema = {
  tags: ["health"],
  summary: "Health checks",
  description: "Health checks to monitor the app. Used in tests, for authentication.",
  response: {
    200: {
      type: "object",
      properties: {
        ready: { type: "boolean" },
      },
    },
  },
}

export { getHealthSchema }
