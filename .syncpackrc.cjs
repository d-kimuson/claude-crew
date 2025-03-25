// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  filter: ".",
  indent: "  ",
  semverGroups: [],
  sortAz: [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "resolutions",
    "keywords",
  ],
  sortFirst: [
    "name",
    "description",
    "version",
    "type",
    "main",
    "exports",
    "scripts",
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "engines",
    "packageManager",
    "config",
    "private",
    "author",
  ],
  source: [],
  versionGroups: [],
}

module.exports = config
