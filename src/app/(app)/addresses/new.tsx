import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAddressesStore, type CreateAddressInput } from '@/modules/addresses';

export default function NewAddressScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isSaving = useAddressesStore((s) => s.isSaving);
  const createAddress = useAddressesStore((s) => s.createAddress);
  const clearError = useAddressesStore((s) => s.clearError);

  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const isValid = Boolean(
    streetAddress.trim() &&
    city.trim() &&
    stateProvince.trim() &&
    postalCode.trim() &&
    country.trim(),
  );

  const handleSave = useCallback(async () => {
    if (!isValid) return;
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
      isDefault,
    };

    try {
      await createAddress(input);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la dirección. Inténtalo de nuevo.');
    }
  }, [isValid, clearError, streetAddress, apartment, city, stateProvince, postalCode, country, phone, notes, isDefault, createAddress, router]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Cancelar</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Nueva dirección</Text>

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

            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.fieldLabel}>Dirección predeterminada</Text>
                <Text style={styles.switchHint}>Se usará por defecto en tus pedidos</Text>
              </View>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#ffffff"
              />
            </View>
          </View>

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
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.saveButtonText}>Guardar dirección</Text>
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

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
    },
    backButton: {
      alignSelf: 'flex-start',
      minHeight: 36,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
    },
    backButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
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
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.three,
    },
    switchLabel: {
      flex: 1,
      gap: Spacing.one,
    },
    switchHint: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    saveButton: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.accent,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.background,
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
