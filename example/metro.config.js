const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const root = path.resolve(__dirname, '..');
const libraryPath = path.resolve(root, 'src');

// Packages that should be resolved from example's node_modules
// to avoid duplicate React instances
const packagesToResolve = [
  'react',
  'react-native',
  'react-native-reanimated',
  'react-native-nitro-modules',
  'react-native-gesture-handler',
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-worklets',
];

/**
 * Metro configuration for the example app
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [root, libraryPath],

  resolver: {
    // Ensure these packages resolve to example's node_modules
    // This prevents duplicate React instances in monorepo
    extraNodeModules: new Proxy(
      {
        // Library source
        'react-native-shared-transition': libraryPath,
      },
      {
        get: (target, name) => {
          if (target.hasOwnProperty(name)) {
            return target[name];
          }
          // Resolve from example's node_modules first
          return path.resolve(__dirname, 'node_modules', name);
        },
      }
    ),

    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(root, 'node_modules'),
    ],

    // Disable hierarchical lookup to prevent finding packages in parent node_modules
    disableHierarchicalLookup: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
