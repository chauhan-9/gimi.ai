import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a49ffefb975f4bac9ddbd92c1bc869fe',
  appName: 'Gimi.AI',
  webDir: 'dist',
  server: {
    url: 'https://a49ffefb-975f-4bac-9ddb-d92c1bc869fe.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#09090b',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
