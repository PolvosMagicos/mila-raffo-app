import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/modules/auth';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mi perfil</Text>
        {user && (
          <Text style={styles.name}>{user.name} {user.lastName}</Text>
        )}
        {/* TODO: profile form, addresses */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  title: { fontFamily: FontFamily.editorialBold, fontSize: FontSize['2xl'], color: Colors.light.foreground },
  name: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: Colors.light.muted },
  logoutButton: { marginTop: 'auto', backgroundColor: Colors.light.border, padding: Spacing.three, borderRadius: 8, alignItems: 'center' },
  logoutText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: Colors.light.foreground },
});
