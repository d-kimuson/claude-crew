import { execSync } from "node:child_process"
import { logger } from "../../../lib/logger"
import { constraints } from "../../constraints"

/**
 * コンテナとボリュームを削除し、setup-db前の状態に戻す
 */
export const cleanPostgres = () => {
  try {
    // コンテナの存在確認
    const dockerPsStdout = execSync(
      `docker ps -a --filter name="${constraints.defaultPostgresContainer.containerName}" --format=json`,
      {
        encoding: "utf-8",
      }
    )

    const containerExists = (() => {
      try {
        JSON.parse(dockerPsStdout)
        return true
      } catch {
        return false
      }
    })()

    if (containerExists) {
      // コンテナを停止して削除
      logger.info(
        `Stopping container ${constraints.defaultPostgresContainer.containerName}...`
      )
      execSync(
        `docker stop ${constraints.defaultPostgresContainer.containerName}`,
        {
          encoding: "utf-8",
        }
      )

      logger.info(
        `Removing container ${constraints.defaultPostgresContainer.containerName}...`
      )
      execSync(
        `docker rm ${constraints.defaultPostgresContainer.containerName}`,
        {
          encoding: "utf-8",
        }
      )
    } else {
      logger.info(
        `Container ${constraints.defaultPostgresContainer.containerName} does not exist, skipping...`
      )
    }

    // ボリュームの存在確認
    const volumeExistsCode = execSync(
      `docker volume inspect ${constraints.defaultPostgresContainer.volumeName} >/dev/null 2>&1 || echo "not-exists"`,
      { encoding: "utf-8" }
    )

    if (!volumeExistsCode.includes("not-exists")) {
      // ボリュームを削除
      logger.info(
        `Removing volume ${constraints.defaultPostgresContainer.volumeName}...`
      )
      execSync(
        `docker volume rm ${constraints.defaultPostgresContainer.volumeName}`,
        {
          encoding: "utf-8",
        }
      )
    } else {
      logger.info(
        `Volume ${constraints.defaultPostgresContainer.volumeName} does not exist, skipping...`
      )
    }

    logger.info("✅ Clean up completed. Now in pre setup-db state.")
  } catch (error) {
    logger.error("Failed to clean up Docker resources", error)
    throw error
  }
}
