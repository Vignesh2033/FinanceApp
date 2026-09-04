import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finboom.personalportfolio',
  appName: 'FinBoom Portfolio',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#121815',
      showSpinner: true,
      spinnerColor: '#2C6E49'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#121815'
    }
  }
};

export default config;
