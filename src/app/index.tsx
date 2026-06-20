import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { BrandedSplash } from '@/components/branded-splash';
import { useAuthStore } from '@/modules/auth';
import { useOnboardingStore } from '@/modules/onboarding';

// Tiempo mínimo que el BrandedSplash es visible antes de empezar el fade-out.
// El splash nativo ya oculta el período de carga; estos ms son el "momento de marca".
const SPLASH_MIN_MS = 600;

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingCompleted = useOnboardingStore((s) => s.isCompleted);
  const [shouldHide, setShouldHide] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldHide(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!splashHidden) {
    return (
      <BrandedSplash
        shouldHide={shouldHide}
        onHidden={() => setSplashHidden(true)}
      />
    );
  }

  if (!isAuthenticated) return <Redirect href="/login" />;
  if (onboardingCompleted === false) return <Redirect href={'/step-1-welcome' as never} />;
  return <Redirect href="/home" />;
}
