import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/modules/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear cuenta</Text>
        {/* TODO: Form fields */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => register({ name: '', lastName: '', email: '', password: '' })}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>¿Ya tenés cuenta? Ingresá</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flex: 1, padding: Spacing.four, justifyContent: 'center', gap: Spacing.three },
  title: { fontFamily: FontFamily.editorialBold, fontSize: FontSize['3xl'], color: Colors.light.foreground, textAlign: 'center' },
  button: { backgroundColor: Colors.light.accent, padding: Spacing.three, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: Colors.light.background },
  link: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.light.accent, textAlign: 'center' },
});
