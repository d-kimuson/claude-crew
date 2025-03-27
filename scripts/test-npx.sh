#!/usr/bin/env bash

set -euxo pipefail

name=$(cat package.json | jq -r '.name')
version=$(cat package.json | jq -r '.version')

# clean up previous build
if [[ -z "./${name}-${version}.tgz" ]]; then
  rm -f ${name}-${version}.tgz
fi
npm uninstall -g ${name}@${version}

pnpm build
npm pack

npm install -g ./${name}-${version}.tgz

# check command
npx ${name}@${version} --version
npx ${name}@${version} help
