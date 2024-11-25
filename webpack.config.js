const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Customize the config before returning it.
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-svg': 'react-native-svg-web',
    'react-native-charts-wrapper': 'react-native-web-charts',
    'expo-haptics': path.resolve(__dirname, './src/services/web/expo-haptics.web.ts'),
    'react-native-confetti-cannon': path.resolve(__dirname, './src/components/web/ConfettiCannon.web.tsx'),
    '@react-native-community/datetimepicker': path.resolve(__dirname, './src/components/web/DateTimePicker.web.tsx'),
  };

  // Add .web.tsx extension resolution
  config.resolve.extensions = [
    '.web.tsx',
    '.web.ts',
    '.web.jsx',
    '.web.js',
    '.tsx',
    '.ts',
    '.jsx',
    '.js',
  ];

  return config;
};
