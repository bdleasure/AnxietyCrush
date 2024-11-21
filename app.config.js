module.exports = {
  name: 'AnxietyCrush',
  slug: 'anxiety-crush',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.anxietycrush.app',
    newArchEnabled: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.anxietycrush.app',
    newArchEnabled: true
  },
  web: {
    favicon: './assets/favicon.png'
  },
  experiments: {
    tsconfigPaths: true
  },
  plugins: [
    'expo-router',
    [
      'expo-screen-orientation',
      {
        initialOrientation: 'PORTRAIT'
      }
    ]
  ],
  scheme: 'anxiety-crush',
  developmentClient: {
    silentLaunch: true
  },
  updates: {
    url: 'https://u.expo.dev/anxiety-crush'
  },
  extra: {
    eas: {
      projectId: 'anxiety-crush'
    }
  },
  owner: 'anxiety-crush',
  runtimeVersion: {
    policy: 'sdkVersion'
  }
};
