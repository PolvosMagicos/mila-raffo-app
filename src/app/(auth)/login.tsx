import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Shake, type ShakeRef } from '@/components/ui/animations';
import { useAuthStore } from '@/modules/auth';

const BG = require('../../../assets/images/auth-bg.png');
const LOGO = require('../../../assets/images/logo-mila.png');
const ACCENT = '#EC7C43';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const shakeRef = useRef<ShakeRef>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const error = localError || storeError;

  useEffect(() => {
    if (error) shakeRef.current?.trigger();
  }, [error]);

  function validate(): boolean {
    if (!email.trim()) { setLocalError('El email es requerido'); return false; }
    if (!email.includes('@')) { setLocalError('Ingresa un email válido'); return false; }
    if (!password) { setLocalError('La contraseña es requerida'); return false; }
    return true;
  }

  async function handleLogin() {
    setLocalError('');
    clearError();
    if (!validate()) return;

    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch {
      // error ya guardado en el store
    }
  }

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      {/* Capa oscura sobre la imagen */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.container}>

            {/* Cabecera de marca */}
            <View style={styles.header}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              <View style={styles.brandDivider} />
              <Text style={styles.subtitle}>Inicia sesión</Text>
            </View>

            {/* Formulario */}
            <Shake ref={shakeRef}>
              <View style={styles.form}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>EMAIL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={email}
                    onChangeText={(v) => { setLocalError(''); clearError(); setEmail(v); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>CONTRASEÑA</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={password}
                    onChangeText={(v) => { setLocalError(''); clearError(); setPassword(v); }}
                    secureTextEntry
                    autoComplete="current-password"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    editable={!isLoading}
                  />
                </View>
              </View>
            </Shake>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Ingresar</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('./register' as never)}
              disabled={isLoading}
            >
              <Text style={styles.link}>
                ¿No tienes cuenta?{' '}
                <Text style={styles.linkAccent}>Regístrate</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 8, 6, 0.55)',
  },
  safe: { flex: 1 },
  flex: { flex: 1 },

  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },

  // ── Cabecera ──────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  logo: {
    width: 280,
    height: 112,
  },
  brandDivider: {
    width: 36,
    height: 1.5,
    backgroundColor: ACCENT,
    marginVertical: Spacing.one,
  },
  subtitle: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
  },

  // ── Formulario ────────────────────────────────────────────────────────────
  form: { gap: Spacing.four },
  inputWrapper: { gap: 6 },
  inputLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: ACCENT,
    letterSpacing: 1.5,
  },
  input: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    color: '#fff',
  },
  error: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: '#fca5a5',
    textAlign: 'center',
    marginTop: -Spacing.two,
  },

  // ── Botón ─────────────────────────────────────────────────────────────────
  button: {
    backgroundColor: ACCENT,
    borderRadius: Radius.full,
    paddingVertical: Spacing.three + 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: '#fff',
    letterSpacing: 1.5,
  },

  // ── Link ──────────────────────────────────────────────────────────────────
  link: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  linkAccent: {
    fontFamily: FontFamily.bodySemiBold,
    color: ACCENT,
  },
});
