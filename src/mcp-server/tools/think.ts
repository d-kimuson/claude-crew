import { z } from "zod"
import { defineTool } from "../utils/defineTool"

export const think = defineTool({
  name: "think",
  description:
    "Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed.",
  inputSchema: z.object({
    thought: z.string().describe("A thought to think about."),
  }),
  execute: () => {
    return {
      success: true,
    }
  },
})
