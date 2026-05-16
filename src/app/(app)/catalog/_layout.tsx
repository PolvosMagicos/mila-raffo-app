import { Stack } from 'expo-router';
import React from 'react';

export default function CatalogLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
