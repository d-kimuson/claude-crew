import { execSync } from "node:child_process"
import getPort from "get-port"
import { constraints } from "../../constraints"

export const startPostgres = async () => {
  const port = await getPort({ port: 6432 })
  const connectUrl = `postgresql://${constraints.defaultPostgresContainer.user}:${constraints.defaultPostgresContainer.password}@127.0.0.1:${port}/${constraints.defaultPostgresContainer.db}`

  // create volume if not exists
  execSync(
    `docker volume inspect ${constraints.defaultPostgresContainer.volumeName} >/dev/null 2>&1 || docker volume create ${constraints.defaultPostgresContainer.volumeName}`,
    { encoding: "utf-8" }
  )

  if (
    execSync(
      `docker ps -a --filter name="${constraints.defaultPostgresContainer.containerName}" --format=json`,
      {
        encoding: "utf-8",
      }
    ) === ""
  ) {
    console.log("Postgres Container is already running")
    return {
      url: connectUrl,
    }
  }

  execSync(
    "docker run -d" +
      `--name ${constraints.defaultPostgresContainer.containerName}` +
      `-e POSTGRES_USER=${constraints.defaultPostgresContainer.user}` +
      `-e POSTGRES_PASSWORD=${constraints.defaultPostgresContainer.password}` +
      `-e POSTGRES_DB=${constraints.defaultPostgresContainer.db}` +
      `-p 127.0.0.1:${port}:5432` +
      `-v ${constraints.defaultPostgresContainer.volumeName}:/var/lib/postgresql/data` +
      "ankane/pgvector:latest",
    {
      encoding: "utf-8",
    }
  )

  return {
    url: connectUrl,
  }
}
