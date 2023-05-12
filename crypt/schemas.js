const postEncryptSchema = {
  tags: ["crypt"],
  summary: "Encryption service",
  description: "Returns iv and ciphered content using a strong algorithm.",
  body: {
    type: "object",
    required: ["keyname", "content"],
    properties: {
      keyname: { type: "string", description: "the key to use" },
      content: { type: "string", description: "UTF-8 content to encrypt" },
    },
  },
  response: {
    200: {
      type: "object",
      required: ["content", "iv"],
      properties: {
        content: { type: "string", description: "encrypted content in hex format" },
        iv: { type: "string", description: "initialization vector (iv) in hex format" },
      },
    },
  },
}

const postDecryptSchema = {
  tags: ["crypt"],
  summary: "Decryption service",
  description: "Returns cleartext.",
  body: {
    type: "object",
    required: ["keyname", "content", "iv"],
    properties: {
      keyname: { type: "string", description: "the key to use" },
      content: { type: "string", description: "encrypted content in hex format" },
      iv: { type: "string", description: "initialization vector (iv) in hex format" },
    },
  },
  response: {
    200: { type: "string", description: "UTF-8 decrypted content" },
  },
}

export { postEncryptSchema, postDecryptSchema }
