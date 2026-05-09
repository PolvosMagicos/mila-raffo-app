import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>Mila Raffo</Text>
        <Text style={styles.subtitle}>Bienvenida</Text>
        {/* TODO: home content */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flex: 1, padding: Spacing.four, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  brand: { fontFamily: FontFamily.editorialBold, fontSize: FontSize['4xl'], color: Colors.light.foreground },
  subtitle: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.light.muted },
});
