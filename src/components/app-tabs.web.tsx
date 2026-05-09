import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <WebTabList>
          <TabTrigger name="home" href="/home" asChild>
            <TabButton>Inicio</TabButton>
          </TabTrigger>
          <TabTrigger name="catalog" href="/catalog" asChild>
            <TabButton>Catálogo</TabButton>
          </TabTrigger>
          <TabTrigger name="cart" href="/(app)/cart" asChild>
            <TabButton>Carrito</TabButton>
          </TabTrigger>
          <TabTrigger name="orders" href="/(app)/orders" asChild>
            <TabButton>Pedidos</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/(app)/profile" asChild>
            <TabButton>Perfil</TabButton>
          </TabTrigger>
        </WebTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed ? styles.pressed : undefined}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButton}
      >
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function WebTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View {...props} style={styles.container}>
      <ThemedView type="backgroundElement" style={[styles.inner, { maxWidth: MaxContentWidth }]}>
        <ThemedText type="smallBold" style={styles.brand}>
          Mila Raffo
        </ThemedText>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  inner: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
  },
  brand: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
