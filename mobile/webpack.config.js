const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['expo-router']
      }
    },
    argv
  );
  
  // Add resolution for expo-router
  config.resolve.alias = {
    ...config.resolve.alias,
    'expo-router': path.resolve(__dirname, 'node_modules/expo-router'),
  };

  // Ensure the correct loader is used for expo-router
  config.module.rules.push({
    test: /\/node_modules\/expo-router\//,
    use: 'babel-loader'
  });
  
  return config;
};