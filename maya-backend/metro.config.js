// mayamobile/metro.config.js
/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    // Remove the custom transformer
    // babelTransformerPath: require.resolve('react-native-typescript-transformer'),
  },
  resolver: {
    sourceExts: ['ts', 'tsx', 'js', 'jsx', 'json'],
  },
};