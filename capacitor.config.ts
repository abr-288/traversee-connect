import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.breserve.app',
  appName: 'B-Reserve',
  webDir: 'dist',
  server: {
    // Remove or comment out in production builds for app stores
    // url: "https://c578be0d-e311-48f6-ab2f-f246e1cb5990.lovableproject.com?forceHideBadge=true",
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0c4a6e',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0c4a6e'
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  },
  ios: {
    scheme: 'B-Reserve'
  }
};

export default config;
