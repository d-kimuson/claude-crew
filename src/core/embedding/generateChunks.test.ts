import { describe, expect, it } from "vitest"
import { generateChunks } from "./generateChunks"

describe("Given the generateChunks function", () => {
  describe("When generating chunks from empty input", () => {
    it("Then returns an empty array", () => {
      const result = generateChunks("", "test.ts")
      expect(result).toEqual([])

      const resultWithWhitespace = generateChunks("   ", "test.ts")
      expect(resultWithWhitespace).toEqual([])
    })
  })

  describe("When generating chunks from TypeScript code", () => {
    it("Then parses functions and classes into separate chunks", () => {
      const tsCode = `
import { something } from 'somewhere';

function testFunction() {
  return 'hello world';
}

class TestClass {
  private value: string;
  
  constructor(val: string) {
    this.value = val;
  }
  
  getValue(): string {
    return this.value;
  }
}

export const constantValue = 'test';
`

      const result = generateChunks(tsCode, "test.ts")

      // Verify we have multiple chunks
      expect(result.length).toBeGreaterThan(1)

      // Check that each chunk has the correct structure
      result.forEach((chunk) => {
        expect(chunk).toHaveProperty("filePath", "test.ts")
        expect(chunk).toHaveProperty("startLine")
        expect(chunk).toHaveProperty("endLine")
        expect(chunk).toHaveProperty("content")
        expect(typeof chunk.content).toBe("string")
      })

      // Function chunk should contain the function code
      expect(
        result.some((chunk) => chunk.content.includes("function testFunction"))
      ).toBe(true)

      // Class chunk should contain the class code
      expect(
        result.some((chunk) => chunk.content.includes("class TestClass"))
      ).toBe(true)
    })
  })

  describe("When generating chunks from JavaScript code", () => {
    it("Then parses JavaScript constructs into chunks", () => {
      const jsCode = `
// A simple JavaScript file
function greet(name) {
  return \`Hello, \${name}!\`;
}

const person = {
  name: 'World',
  sayHello: function() {
    console.log(greet(this.name));
  }
};

person.sayHello();
`

      const result = generateChunks(jsCode, "test.js")

      // Verify we have chunks
      expect(result.length).toBeGreaterThan(0)

      // Check for function chunk
      expect(
        result.some((chunk) => chunk.content.includes("function greet(name)"))
      ).toBe(true)
    })
  })

  describe("When generating chunks from unsupported file types", () => {
    it("Then falls back to line-based chunking", () => {
      const textContent = `This is a plain text file.
It has multiple lines.
Each line has some words.
This should be chunked based on line count and word count.
Not based on syntax parsing.
Line based chunking is the fallback mechanism.
It should work for any text file regardless of content.`

      const result = generateChunks(textContent, "test.txt")

      // Should have at least one chunk
      expect(result.length).toBeGreaterThan(0)

      // Each chunk should have the correct structure
      result.forEach((chunk) => {
        expect(chunk).toHaveProperty("filePath", "test.txt")
        expect(chunk).toHaveProperty("startLine")
        expect(chunk).toHaveProperty("endLine")
        expect(chunk).toHaveProperty("content")
      })
    })
  })

  describe("When the file contains breakpoints", () => {
    it("Then chunks are created based on breakpoints", () => {
      const sqlWithBreakpoints = `CREATE TABLE user (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE post (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id INTEGER REFERENCES user(id)
);`

      const result = generateChunks(sqlWithBreakpoints, "schema.sql")

      // Should have exactly 2 chunks (split by breakpoint)
      expect(result.length).toBe(2)

      // First chunk should contain the user table creation
      expect(result[0]?.content).toContain("CREATE TABLE user")

      // Second chunk should contain the post table creation
      expect(result[1]?.content).toContain("CREATE TABLE post")
    })
  })
})
