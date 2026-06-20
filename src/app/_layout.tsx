import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { DeviceEventEmitter, useColorScheme } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

import { APP_FONTS } from '@/constants/fonts';
import { AUTH_SESSION_EXPIRED_EVENT } from '@/core/network/api-client';
import { useAuthStore } from '@/modules/auth';
import { useOnboardingStore } from '@/modules/onboarding';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const initialize = useAuthStore((s) => s.initialize);
  const authLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const onboardingInit = useOnboardingStore((s) => s.initialize);
  const onboardingLoading = useOnboardingStore((s) => s.isLoading);
  const onboardingCompleted = useOnboardingStore((s) => s.isCompleted);
  const [fontsLoaded] = useFonts(APP_FONTS);

  // null = onboarding aún no fue leído desde storage → esperamos
  const isReady = fontsLoaded && !authLoading && !onboardingLoading && onboardingCompleted !== null;

  useEffect(() => {
    initialize();
    onboardingInit();
  }, [initialize, onboardingInit]);

  // Cuando refresh token expira el interceptor emite este evento;
  // hacemos logout sin importar api-client desde el store (evita circular dep).
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(AUTH_SESSION_EXPIRED_EVENT, () => {
      void logout();
    });
    return () => sub.remove();
  }, [logout]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      if (data.type === 'order_status' && typeof data.orderId === 'string') {
        router.push(`/orders/${data.orderId}` as never);
      } else if (data.type === 'shipment_status' && typeof data.orderId === 'string') {
        router.push(`/orders/${data.orderId}/shipment` as never);
      } else if (data.type === 'offer') {
        router.push('/catalog' as never);
      }
    });
    return () => sub.remove();
  }, [router]);

  // Ocultar splash nativo cuando el estado está listo; index.tsx maneja
  // el BrandedSplash como pantalla normal (con LinkingContext disponible).
  useEffect(() => {
    if (isReady) void SplashScreen.hideAsync();
  }, [isReady]);

  // return null → Expo Router no intenta renderizar rutas todavía,
  // evitando que (app)/_layout.tsx intente usar <Tabs> sin LinkingContext.
  if (!isReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/*
       * <Stack> (en lugar de <Slot>) inicializa el NavigationContainer de expo-router
       * con LinkingContext disponible para navegadores hijos como <Tabs>.
       * animation: 'none' → sin transiciones visibles en el root (cada grupo
       * maneja sus propias transiciones internamente).
       */}
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </ThemeProvider>
  );
}
