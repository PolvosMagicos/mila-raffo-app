import { Redirect } from 'expo-router';
import React from 'react';

import { useAuthStore } from '@/modules/auth';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // El root _layout.tsx ya esperó a que isLoading = false antes de renderizar <Slot>.
  // Acá el estado de auth ya está resuelto — redirigimos sin condición de carga.
  return <Redirect href={isAuthenticated ? '/home' : '/login'} />;
}
