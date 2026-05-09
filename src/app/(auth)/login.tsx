import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/modules/auth';

export default function LoginScreen() {
  const router = useRouter();
  // Selectores primitivos: un selector por valor para evitar el loop de getSnapshot en React 19.
  // useAuthStore((s) => ({ a, b })) crea un objeto nuevo en cada llamada → referencia inestable → loop.
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mila Raffo</Text>
        <Text style={styles.subtitle}>Iniciá sesión</Text>
        {/* TODO: Form fields */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => login({ email: '', password: '' })}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('./register' as never)}>
          <Text style={styles.link}>¿No tenés cuenta? Registrate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flex: 1, padding: Spacing.four, justifyContent: 'center', gap: Spacing.three },
  title: { fontFamily: FontFamily.editorialBold, fontSize: FontSize['3xl'], color: Colors.light.foreground, textAlign: 'center' },
  subtitle: { fontFamily: FontFamily.body, fontSize: FontSize.lg, color: Colors.light.muted, textAlign: 'center' },
  button: { backgroundColor: Colors.light.accent, padding: Spacing.three, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: Colors.light.background },
  link: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.light.accent, textAlign: 'center' },
});
