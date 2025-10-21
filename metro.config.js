const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.enableBabelRCLookup = false;
config.watchFolders = [];

module.exports = config;
