import { Project, Node } from "ts-morph"
import { z } from "zod"
import { defineTool } from "../utils/defineTool"
import { toErrorResponse, toResponse } from "../utils/toResponse"
import { integration } from "./interface"

export const typescriptIntegration = integration({
  name: "typescript",
  configSchema: z.object({
    tsConfigFilePath: z.string(),
  }),
}).tools((config) => {
  const project = new Project({
    tsConfigFilePath: config.tsConfigFilePath,
    skipAddingFilesFromTsConfig: false,
  })

  // Check if the node is a declaration
  const isDeclaration = (node: Node): boolean => {
    const parent = node.getParent()
    if (!parent) return false

    return (
      Node.isVariableDeclaration(parent) ||
      Node.isFunctionDeclaration(parent) ||
      Node.isClassDeclaration(parent) ||
      Node.isInterfaceDeclaration(parent) ||
      Node.isTypeAliasDeclaration(parent) ||
      Node.isParameterDeclaration(parent) ||
      Node.isPropertyDeclaration(parent) ||
      Node.isMethodDeclaration(parent) ||
      // For const/let/var declarations, we need to check the grandparent
      (Node.isBindingElement(parent) &&
        Node.isVariableDeclaration(parent.getParent()))
    )
  }

  return [
    defineTool(({ server, ...ctx }) => {
      return server.tool(
        `${ctx.config.name}-search-typescript-declaration`,
        `Search for a typescript declaration`,
        {
          identifier: z
            .string()
            .describe(
              "Identifier to search for. Such as function name, class name, interface name, etc."
            ),
        },
        (input, _extra) => {
          try {
            const results: {
              filePath: string
              sourceCode: string
              position: { line: number; column: number }
            }[] = []

            // Search all source files in the project
            project.getSourceFiles().forEach((sourceFile) => {
              // Search for nodes matching the identifier
              sourceFile.forEachDescendant((node: Node) => {
                if (
                  Node.isIdentifier(node) &&
                  node.getText() === input.identifier &&
                  isDeclaration(node)
                ) {
                  const { line, column } = sourceFile.getLineAndColumnAtPos(
                    node.getStart()
                  )
                  results.push({
                    filePath: sourceFile.getFilePath(),
                    sourceCode: node.getParent()?.getText() || node.getText(),
                    position: { line, column },
                  })
                }
              })
            })

            return toResponse({
              success: true,
              found: results,
            })
          } catch (error) {
            return toErrorResponse(error)
          }
        }
      )
    }),
  ] as const
})
