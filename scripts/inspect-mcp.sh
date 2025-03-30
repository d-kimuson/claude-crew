#!/usr/bin/env bash

set -euo pipefail

cd $(git rev-parse --show-toplevel)

./scripts/test-npx.sh

name=$(cat package.json | jq -r '.name')
version=$(cat package.json | jq -r '.version')
pnpm dlx @modelcontextprotocol/inspector npx ${name}@${version} serve-mcp ./.claude-crew/config.json

cd -
