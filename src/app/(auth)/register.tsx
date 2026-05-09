import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/modules/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // refs para saltar entre campos con el teclado
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const error = localError || storeError;

  function clearLocal() { setLocalError(''); clearError(); }

  function validate(): boolean {
    if (!name.trim()) { setLocalError('El nombre es requerido'); return false; }
    if (name.trim().length < 2) { setLocalError('El nombre debe tener al menos 2 caracteres'); return false; }
    if (!lastName.trim()) { setLocalError('El apellido es requerido'); return false; }
    if (lastName.trim().length < 2) { setLocalError('El apellido debe tener al menos 2 caracteres'); return false; }
    if (!email.trim()) { setLocalError('El email es requerido'); return false; }
    if (!email.includes('@')) { setLocalError('Ingresá un email válido'); return false; }
    if (!password) { setLocalError('La contraseña es requerida'); return false; }
    if (password.length < 8) { setLocalError('La contraseña debe tener al menos 8 caracteres'); return false; }
    return true;
  }

  async function handleRegister() {
    setLocalError('');
    clearError();
    if (!validate()) return;

    try {
      await register({
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
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
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Crear cuenta</Text>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Nombre"
              placeholderTextColor={Colors.light.muted}
              value={name}
              onChangeText={(v) => { clearLocal(); setName(v); }}
              autoCapitalize="words"
              autoComplete="given-name"
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              editable={!isLoading}
            />
            <TextInput
              ref={lastNameRef}
              style={[styles.input, styles.inputHalf]}
              placeholder="Apellido"
              placeholderTextColor={Colors.light.muted}
              value={lastName}
              onChangeText={(v) => { clearLocal(); setLastName(v); }}
              autoCapitalize="words"
              autoComplete="family-name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              editable={!isLoading}
            />
          </View>

          <TextInput
            ref={emailRef}
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.light.muted}
            value={email}
            onChangeText={(v) => { clearLocal(); setEmail(v); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!isLoading}
          />

          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Contraseña (mínimo 8 caracteres)"
            placeholderTextColor={Colors.light.muted}
            value={password}
            onChangeText={(v) => { clearLocal(); setPassword(v); }}
            secureTextEntry
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            editable={!isLoading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color={Colors.light.background} />
              : <Text style={styles.buttonText}>Registrarse</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
            <Text style={styles.link}>¿Ya tenés cuenta? Ingresá</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
  title: {
    fontFamily: FontFamily.editorialBold,
    fontSize: FontSize['2xl'],
    color: Colors.light.foreground,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
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
  inputHalf: { flex: 1 },
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
