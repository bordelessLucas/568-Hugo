const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

/** If someone runs Expo from the monorepo root, treat mobile/ as the project. */
const projectRoot = path.resolve(__dirname, 'mobile')
const workspaceRoot = __dirname
const backRoot = path.resolve(workspaceRoot, 'back')
const config = getDefaultConfig(projectRoot)

config.watchFolders = [projectRoot, backRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(backRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.disableHierarchicalLookup = true

module.exports = config
