import { execSync } from "node:child_process"
import chalk from "chalk"
import { logger } from "../../../lib/logger"
import { constraints } from "../../constraints"

/**
 * コンテナとボリュームを削除し、setup-db前の状態に戻す
 */
export const cleanPostgres = () => {
  try {
    logger.title("Cleaning up PostgreSQL resources")

    // コンテナの存在確認
    const containerSpinner = logger.spinner(
      "Checking for existing container..."
    )
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
      containerSpinner.succeed(
        `Found container: ${chalk.cyan(constraints.defaultPostgresContainer.containerName)}`
      )

      // コンテナを停止して削除
      const stopSpinner = logger.spinner(`Stopping container...`)
      execSync(
        `docker stop ${constraints.defaultPostgresContainer.containerName}`,
        {
          encoding: "utf-8",
        }
      )
      stopSpinner.succeed(`Container stopped successfully`)

      const removeSpinner = logger.spinner(`Removing container...`)
      execSync(
        `docker rm ${constraints.defaultPostgresContainer.containerName}`,
        {
          encoding: "utf-8",
        }
      )
      removeSpinner.succeed(
        `Container ${chalk.cyan(constraints.defaultPostgresContainer.containerName)} removed successfully`
      )
    } else {
      containerSpinner.info(
        `Container ${chalk.cyan(constraints.defaultPostgresContainer.containerName)} does not exist, skipping...`
      )
    }

    // ボリュームの存在確認
    const volumeSpinner = logger.spinner("Checking for existing volume...")
    const volumeExistsCode = execSync(
      `docker volume inspect ${constraints.defaultPostgresContainer.volumeName} >/dev/null 2>&1 || echo "not-exists"`,
      { encoding: "utf-8" }
    )

    if (!volumeExistsCode.includes("not-exists")) {
      volumeSpinner.succeed(
        `Found volume: ${chalk.cyan(constraints.defaultPostgresContainer.volumeName)}`
      )

      // ボリュームを削除
      const removeVolumeSpinner = logger.spinner(`Removing volume...`)
      execSync(
        `docker volume rm ${constraints.defaultPostgresContainer.volumeName}`,
        {
          encoding: "utf-8",
        }
      )
      removeVolumeSpinner.succeed(
        `Volume ${chalk.cyan(constraints.defaultPostgresContainer.volumeName)} removed successfully`
      )
    } else {
      volumeSpinner.info(
        `Volume ${chalk.cyan(constraints.defaultPostgresContainer.volumeName)} does not exist, skipping...`
      )
    }

    logger.box("Cleanup completed successfully! Now in pre setup-db state.", {
      borderColor: "green",
    })
  } catch (error) {
    logger.error("Failed to clean up Docker resources", error)
    throw error
  }
}
