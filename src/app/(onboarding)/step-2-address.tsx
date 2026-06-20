import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontFamily, FontSize, Palette, Radius, Spacing } from '@/constants/theme';
import { useAddressesStore, type CreateAddressInput } from '@/modules/addresses';
import { FadeInView, Shake, type ShakeRef } from '@/components/ui/animations';

const TOTAL_STEPS = 4;

export default function OnboardingStep2() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const shakeRef = useRef<ShakeRef>(null);

  const isSaving = useAddressesStore((s) => s.isSaving);
  const createAddress = useAddressesStore((s) => s.createAddress);
  const clearError = useAddressesStore((s) => s.clearError);

  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Perú');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const isValid = Boolean(
    streetAddress.trim() &&
    city.trim() &&
    stateProvince.trim() &&
    postalCode.trim() &&
    country.trim(),
  );

  const handleUseLocation = useCallback(async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Activa el permiso de ubicación en Configuración para usar esta función.',
        );
        return;
      }
      Alert.alert(
        'Ubicación detectada',
        'Completá los campos de dirección manualmente con tu ubicación actual.',
      );
    } catch {
      Alert.alert('Error', 'No se pudo obtener la ubicación. Ingrésala manualmente.');
    } finally {
      setIsLocating(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!isValid) {
      shakeRef.current?.trigger();
      return;
    }
    clearError();

    const input: CreateAddressInput = {
      streetAddress: streetAddress.trim(),
      apartment: apartment.trim() || undefined,
      city: city.trim(),
      stateProvince: stateProvince.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      isDefault: true,
    };

    try {
      await createAddress(input);
      router.push('/step-3-confirm' as never);
    } catch {
      shakeRef.current?.trigger();
      Alert.alert('Error', 'No se pudo guardar la dirección. Inténtalo de nuevo.');
    }
  }, [isValid, clearError, streetAddress, apartment, city, stateProvince, postalCode, country, phone, notes, createAddress, router]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FadeInView slideFrom="bottom" delay={0} duration={250} style={styles.headerRow}>
          <StepDots total={TOTAL_STEPS} current={1} />
          <Text style={styles.stepLabel}>Paso 2 de 4</Text>
        </FadeInView>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FadeInView slideFrom="bottom" delay={80} duration={250}>
            <Text style={styles.title}>Tu dirección{'\n'}de entrega</Text>
            <Text style={styles.subtitle}>
              La usaremos como dirección predeterminada para tus pedidos.
            </Text>
          </FadeInView>

          <FadeInView delay={140} duration={250}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.locationButton, pressed && styles.pressed]}
              onPress={handleUseLocation}
              disabled={isLocating}
            >
              {isLocating
                ? <ActivityIndicator size="small" color={Palette.accent} />
                : <Ionicons name="location-outline" size={18} color={Palette.accent} />
              }
              <Text style={styles.locationText}>Usar mi ubicación actual</Text>
            </Pressable>
          </FadeInView>

          <Shake ref={shakeRef}>
            <View style={styles.form}>
              <Field label="Dirección *" styles={styles} colors={colors}>
                <TextInput
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                  placeholder="Av. Larco 123"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </Field>

              <Field label="Apartamento / Piso" styles={styles} colors={colors}>
                <TextInput
                  value={apartment}
                  onChangeText={setApartment}
                  placeholder="Dpto. 4B (opcional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </Field>

              <Field label="Ciudad *" styles={styles} colors={colors}>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="Lima"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </Field>

              <Field label="Provincia / Región *" styles={styles} colors={colors}>
                <TextInput
                  value={stateProvince}
                  onChangeText={setStateProvince}
                  placeholder="Lima"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </Field>

              <Field label="Código postal *" styles={styles} colors={colors}>
                <TextInput
                  value={postalCode}
                  onChangeText={setPostalCode}
                  placeholder="15001"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  keyboardType="number-pad"
                  returnKeyType="next"
                />
              </Field>

              <Field label="País *" styles={styles} colors={colors}>
                <TextInput
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Perú"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </Field>

              <Field label="Teléfono de contacto" styles={styles} colors={colors}>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+51 999 999 999"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </Field>

              <Field label="Notas de entrega" styles={styles} colors={colors}>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Referencias, instrucciones especiales..."
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.inputMultiline]}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                />
              </Field>
            </View>
          </Shake>

          <Pressable
            accessibilityRole="button"
            disabled={!isValid || isSaving}
            style={({ pressed }) => [
              styles.saveButton,
              (!isValid || isSaving) && styles.saveButtonDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleSave}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Continuar</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  children,
  styles,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[dotStyles.dot, i === current && dotStyles.dotActive]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    width: 20,
    backgroundColor: Palette.accent,
  },
});

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.three,
    },
    stepLabel: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    content: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.six,
      gap: Spacing.three,
    },
    title: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: colors.foreground,
      lineHeight: 44,
      marginBottom: Spacing.one,
    },
    subtitle: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
      lineHeight: 20,
    },
    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderWidth: 1,
      borderColor: Palette.accent,
      borderRadius: Radius.sm,
      alignSelf: 'flex-start',
    },
    locationText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: Palette.accent,
    },
    form: {
      gap: Spacing.three,
    },
    field: {
      gap: Spacing.one,
    },
    fieldLabel: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    input: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: colors.foreground,
      backgroundColor: colors.background,
    },
    inputMultiline: {
      minHeight: 80,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.two,
      textAlignVertical: 'top',
    },
    saveButton: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: Palette.accent,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: '#fff',
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
