import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
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

import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Shake, type ShakeRef } from '@/components/ui/animations';
import { useAuthStore } from '@/modules/auth';

const BG = require('../../../assets/images/auth-bg.png');
const LOGO = require('../../../assets/images/logo-mila.png');
const ACCENT = '#EC7C43';

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

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const shakeRef = useRef<ShakeRef>(null);

  const error = localError || storeError;

  useEffect(() => {
    if (error) shakeRef.current?.trigger();
  }, [error]);

  function clearLocal() { setLocalError(''); clearError(); }

  function validate(): boolean {
    if (!name.trim()) { setLocalError('El nombre es requerido'); return false; }
    if (name.trim().length < 2) { setLocalError('El nombre debe tener al menos 2 caracteres'); return false; }
    if (!lastName.trim()) { setLocalError('El apellido es requerido'); return false; }
    if (lastName.trim().length < 2) { setLocalError('El apellido debe tener al menos 2 caracteres'); return false; }
    if (!email.trim()) { setLocalError('El email es requerido'); return false; }
    if (!email.includes('@')) { setLocalError('Ingresa un email válido'); return false; }
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
    } catch {
      // error ya guardado en el store
    }
  }

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* Cabecera */}
            <View style={styles.header}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              <View style={styles.brandDivider} />
              <Text style={styles.title}>Crear cuenta</Text>
              <Text style={styles.subtitle}>Completa tus datos para comenzar</Text>
            </View>

            <Shake ref={shakeRef}>
              {/* Nombre y apellido */}
              <View style={styles.row}>
                <View style={[styles.inputWrapper, styles.inputHalf]}>
                  <Text style={styles.inputLabel}>NOMBRE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="María"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={name}
                    onChangeText={(v) => { clearLocal(); setName(v); }}
                    autoCapitalize="words"
                    autoComplete="given-name"
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    editable={!isLoading}
                  />
                </View>
                <View style={[styles.inputWrapper, styles.inputHalf]}>
                  <Text style={styles.inputLabel}>APELLIDO</Text>
                  <TextInput
                    ref={lastNameRef}
                    style={styles.input}
                    placeholder="García"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={lastName}
                    onChangeText={(v) => { clearLocal(); setLastName(v); }}
                    autoCapitalize="words"
                    autoComplete="family-name"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={email}
                  onChangeText={(v) => { clearLocal(); setEmail(v); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>CONTRASEÑA</Text>
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={password}
                  onChangeText={(v) => { clearLocal(); setPassword(v); }}
                  secureTextEntry
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  editable={!isLoading}
                />
              </View>
            </Shake>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Crear cuenta</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
              <Text style={styles.link}>
                ¿Ya tienes cuenta?{' '}
                <Text style={styles.linkAccent}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>

          </ScrollView>
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
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    paddingTop: Spacing.five,
    gap: Spacing.four,
  },

  // ── Cabecera ──────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  logo: {
    width: 280,
    height: 112,
  },
  brandDivider: {
    width: 28,
    height: 1.5,
    backgroundColor: ACCENT,
    marginVertical: Spacing.one,
  },
  title: {
    fontFamily: FontFamily.editorialBold,
    fontSize: FontSize['2xl'],
    color: '#fff',
    marginTop: Spacing.one,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.3,
  },

  // ── Formulario ────────────────────────────────────────────────────────────
  row: { flexDirection: 'row', gap: Spacing.three },
  inputWrapper: { gap: 6 },
  inputHalf: { flex: 1 },
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
