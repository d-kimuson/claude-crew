import { z } from "zod"
import { defineTool } from "../utils/defineTool"

export const think = defineTool(({ server, config }) =>
  server.tool(
    `${config.name}-think`,
    "Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed.",
    {
      thought: z.string().describe("A thought to think about."),
    },
    () => {
      return {
        isError: false,
        content: [{ type: "text", text: "success" }],
      }
    }
  )
)
