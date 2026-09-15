const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '..')
const backRoot = path.resolve(workspaceRoot, 'back')
const config = getDefaultConfig(projectRoot)

// Shared package lives outside mobile/; Metro must watch it and resolve its deps.
config.watchFolders = [backRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(backRoot, 'node_modules'),
]
config.resolver.disableHierarchicalLookup = true

module.exports = config
