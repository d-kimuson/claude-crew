export const constraints = {
  defaultPostgresContainer: {
    containerName: "claude-crew-postgres",
    volumeName: "claude-crew-pgdata",
    user: "postgres",
    password: "postgres",
    db: "claude-crew-embeddings",
  },
}
