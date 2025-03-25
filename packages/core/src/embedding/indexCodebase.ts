import { existsSync } from "node:fs"
import { readFile, readdir, stat } from "node:fs/promises"
import path from "node:path"
import { eq } from "drizzle-orm"
import ignore from "ignore"
import { projectsTable } from "../lib/drizzle/schema/projects"
import { withDb } from "../lib/drizzle/withDb"
import { upsertEmbeddingResource } from "./upsertEmbeddingResource"

/**
 * .gitignoreファイルを読み込み、ignoreインスタンスを返します
 * @param rootDir .gitignoreが配置されているルートディレクトリ
 * @returns .gitignoreルールを含むignoreインスタンス
 */
const getGitIgnore = async (rootDir: string): Promise<ignore.Ignore> => {
  const ig = ignore()

  try {
    const gitignorePath = path.join(rootDir, ".gitignore")
    if (existsSync(gitignorePath)) {
      const gitignoreContent = await readFile(gitignorePath, {
        encoding: "utf8",
      })
      ig.add(gitignoreContent)
    }
  } catch (error) {
    console.error("Error reading .gitignore file:", error)
  }

  return ig
}

const blackList = [".git", ".DS_Store"]

/**
 * ディレクトリを再帰的に走査し、すべてのコードファイルをインデックス化します
 * @param projectId リソースを関連付けるプロジェクトのID
 * @param rootDir 走査を開始するルートディレクトリ
 * @param currentDir 現在走査中のディレクトリ（再帰処理に使用）
 * @param gitIgnore .gitignoreルールを含むignoreインスタンス
 * @returns すべてのファイルがインデックス化されたときに解決されるプロミス
 */
const traverseDirectory = withDb(
  (ctx) =>
    async (
      projectId: string,
      rootDir: string,
      currentDir: string = rootDir,
      gitIgnoresRec: {
        baseDir: string
        ignore: ignore.Ignore
      }[] = []
    ): Promise<string[]> => {
      const results: string[] = []
      const gitIgnores = [
        ...gitIgnoresRec,
        {
          baseDir: currentDir,
          ignore: await getGitIgnore(currentDir),
        },
      ]

      try {
        const entries = await readdir(currentDir, { withFileTypes: true })

        await Promise.all(
          entries.map(async (entry) => {
            const entryPath = path.join(currentDir, entry.name)

            // エントリが無視される場合はスキップ
            if (
              gitIgnores.some(({ ignore, baseDir }) =>
                ignore.ignores(path.relative(baseDir, entryPath))
              ) ||
              blackList.includes(entry.name)
            ) {
              return
            }

            if (entry.isDirectory()) {
              // サブディレクトリを再帰的に走査
              const subResults = await traverseDirectory(ctx)(
                projectId,
                rootDir,
                entryPath,
                gitIgnores
              )
              results.push(...subResults)
            } else if (entry.isFile()) {
              try {
                // ファイルの内容を読み込む
                const content = await readFile(entryPath, { encoding: "utf8" })

                // リソースを作成し、埋め込みを生成
                await upsertEmbeddingResource(ctx)({
                  projectId,
                  filePath: entryPath,
                  content,
                })

                results.push(entryPath)
                console.log(`Indexed: ${entryPath}`)
              } catch (error) {
                console.error(`Error indexing file ${entryPath}:`, error)
              }
            }
          })
        )
      } catch (error) {
        console.error(`Error traversing directory ${currentDir}:`, error)
      }

      return results
    }
)
/**
 * .gitignoreで指定されたパスを除外して、ディレクトリ内のすべてのコードファイルをインデックス化します
 * @param directoryPath インデックス化するディレクトリのパス
 * @returns インデックス化されたファイルパスの配列で解決されるプロミス
 */
export const indexCodebase = withDb(
  (ctx) =>
    async (directoryPath: string): Promise<string[]> => {
      try {
        // 絶対パスを解決
        const absolutePath = directoryPath.startsWith("/")
          ? directoryPath
          : path.resolve(process.cwd(), directoryPath)

        // ディレクトリが存在するか確認
        if (
          !existsSync(absolutePath) ||
          !(await stat(absolutePath)).isDirectory()
        ) {
          throw new Error(`Directory not found: ${absolutePath}`)
        }

        // プロジェクトを取得または作成
        const projects = await ctx.db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.name, absolutePath))
          .limit(1)

        let project = projects[0]

        if (!project) {
          const [newProject] = await ctx.db
            .insert(projectsTable)
            .values({ name: absolutePath })
            .returning()
          project = newProject
        }

        if (!project) {
          throw new Error(`Failed to create or find project: ${absolutePath}`)
        }

        // ディレクトリを走査し、すべてのコードファイルをインデックス化
        console.log(`Starting indexing of codebase at: ${absolutePath}`)
        const indexedFiles = await traverseDirectory(ctx)(
          project.id,
          absolutePath,
          absolutePath,
          []
        )
        console.log(`Indexing complete. Indexed ${indexedFiles.length} files.`)

        return indexedFiles
      } catch (error) {
        console.error("Error indexing codebase:", error)
        throw error
      }
    }
)
