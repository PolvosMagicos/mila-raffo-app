import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/modules/auth';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const error = localError || storeError;

  function validate(): boolean {
    if (!email.trim()) { setLocalError('El email es requerido'); return false; }
    if (!email.includes('@')) { setLocalError('Ingresá un email válido'); return false; }
    if (!password) { setLocalError('La contraseña es requerida'); return false; }
    return true;
  }

  async function handleLogin() {
    setLocalError('');
    clearError();
    if (!validate()) return;

    try {
      await login({ email: email.trim().toLowerCase(), password });
      // (auth)/_layout.tsx detecta isAuthenticated = true y redirige a /home
    } catch {
      // error ya guardado en el store
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Mila Raffo</Text>
          <Text style={styles.subtitle}>Iniciá sesión</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.light.muted}
            value={email}
            onChangeText={(v) => { setLocalError(''); setEmail(v); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={Colors.light.muted}
            value={password}
            onChangeText={(v) => { setLocalError(''); setPassword(v); }}
            secureTextEntry
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            editable={!isLoading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color={Colors.light.background} />
              : <Text style={styles.buttonText}>Ingresar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('./register' as never)}
            disabled={isLoading}
          >
            <Text style={styles.link}>¿No tenés cuenta? Registrate</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background },
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontFamily: FontFamily.editorialBold,
    fontSize: FontSize['3xl'],
    color: Colors.light.foreground,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.light.muted,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  input: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    color: Colors.light.foreground,
  },
  error: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: '#dc2626',
  },
  button: {
    backgroundColor: Colors.light.accent,
    borderRadius: 8,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.light.background,
  },
  link: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.light.accent,
    textAlign: 'center',
  },
});
