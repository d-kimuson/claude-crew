import { execSync } from "node:child_process"
import getPort from "get-port"
import type { Config } from "../../config/schema"
import { logger } from "../../../lib/logger"
import { writeConfig } from "../../config/writeConfig"
import { constraints } from "../../constraints"

const portsRegExp = /127\.0\.0\.1:(?<port>\d+)->5432\/tcp/

export const createPostgresConfig = async () => {
  const dockerPsStdout = execSync(
    `docker ps -a --filter name="${constraints.defaultPostgresContainer.containerName}" --format=json`,
    {
      encoding: "utf-8",
    }
  )

  const port = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const ports: string = JSON.parse(dockerPsStdout).Ports
      return portsRegExp.exec(ports)?.groups?.["port"]
    } catch {
      return undefined
    }
  })()

  if (port === undefined) {
    const port = await getPort({ port: 6432 })
    const connectUrl = `postgresql://${constraints.defaultPostgresContainer.user}:${constraints.defaultPostgresContainer.password}@127.0.0.1:${port}/${constraints.defaultPostgresContainer.db}`

    return {
      port,
      url: connectUrl,
    }
  } else {
    const connectUrl = `postgresql://${constraints.defaultPostgresContainer.user}:${constraints.defaultPostgresContainer.password}@127.0.0.1:${port}/${constraints.defaultPostgresContainer.db}`

    return {
      port: Number.parseInt(port),
      url: connectUrl,
    }
  }
}

export const startPostgres = async (configPath: string, config: Config) => {
  if (config.database.customDb) {
    return
  }

  // create volume if not exists
  execSync(
    `docker volume inspect ${constraints.defaultPostgresContainer.volumeName} >/dev/null 2>&1 || docker volume create ${constraints.defaultPostgresContainer.volumeName}`,
    { encoding: "utf-8" }
  )

  const dockerPsStdout = execSync(
    `docker ps -a --filter name="${constraints.defaultPostgresContainer.containerName}" --format=json`,
    {
      encoding: "utf-8",
    }
  )

  const dockerPsJson = ((): Record<string, unknown> | undefined => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const json: Record<string, unknown> = JSON.parse(dockerPsStdout)
      return json
    } catch {
      return undefined
    }
  })()

  if (dockerPsJson !== undefined) {
    if (dockerPsJson["State"] === "running") {
      logger.info("Postgres Container is already running")
    } else {
      execSync(
        `docker start ${constraints.defaultPostgresContainer.containerName}`,
        {
          encoding: "utf-8",
        }
      )
    }

    return
  }

  const exactPort = await getPort({ port: config.database.port })
  if (exactPort !== config.database.port) {
    await writeConfig(configPath, {
      ...config,
      database: {
        ...config.database,
        port: exactPort,
      },
    })
  }

  const command =
    "docker run -d " +
    `--name ${constraints.defaultPostgresContainer.containerName} ` +
    `-e POSTGRES_USER=${constraints.defaultPostgresContainer.user} ` +
    `-e POSTGRES_PASSWORD=${constraints.defaultPostgresContainer.password} ` +
    `-e POSTGRES_DB=${constraints.defaultPostgresContainer.db} ` +
    `-p 127.0.0.1:${exactPort}:5432 ` +
    `-v ${constraints.defaultPostgresContainer.volumeName}:/var/lib/postgresql/data ` +
    "ankane/pgvector:latest"

  execSync(`bash -c "${command}"`, {
    encoding: "utf-8",
  })
}
