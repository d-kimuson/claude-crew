import { createHash } from "node:crypto"
import { createReadStream } from "node:fs"

/**
 * Calculate and return a hash value (such as SHA-256) for the contents of a specified file
 * @param filePath Path to the file to be hashed
 * @param algorithm Hash algorithm to use (default: 'sha256')
 * @returns Hash value (hexadecimal string)
 */
export const hashFile = async (
  filePath: string,
  algorithm = "sha256"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm)
    const stream = createReadStream(filePath)

    // Update hash while reading the file as a stream
    stream.on("data", (chunk) => {
      hash.update(chunk)
    })

    stream.on("error", (err) => {
      reject(err)
    })

    // Finalize hash when stream reading is complete
    stream.on("end", () => {
      const digest = hash.digest("hex")
      resolve(digest)
    })
  })
}
