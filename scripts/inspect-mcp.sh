#!/usr/bin/env bash

set -euo pipefail

cd $(git rev-parse --show-toplevel)

pnpm build

name=$(cat package.json | jq -r '.name')
version=$(cat package.json | jq -r '.version')
node_path=$(which node)
current_dir=$(pwd)

pnpm dlx @modelcontextprotocol/inspector ${node_path} ${current_dir}/dist/cli.js serve-mcp ${current_dir}/.claude-crew/config.json

cd -
