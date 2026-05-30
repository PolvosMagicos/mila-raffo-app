import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAddressesStore, type Address } from '@/modules/addresses';

export default function AddressesScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const addresses = useAddressesStore((s) => s.addresses);
  const isFetching = useAddressesStore((s) => s.isFetching);
  const isSaving = useAddressesStore((s) => s.isSaving);
  const fetchAddresses = useAddressesStore((s) => s.fetchAddresses);
  const removeAddress = useAddressesStore((s) => s.removeAddress);
  const setDefault = useAddressesStore((s) => s.setDefault);

  useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  const handleDelete = useCallback(
    (address: Address) => {
      Alert.alert(
        'Eliminar dirección',
        `¿Eliminar "${address.streetAddress}, ${address.city}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => void removeAddress(address.id),
          },
        ],
      );
    },
    [removeAddress],
  );

  const handleSetDefault = useCallback(
    (address: Address) => {
      void setDefault(address.id);
    },
    [setDefault],
  );

  const renderAddress = useCallback(
    ({ item }: { item: Address }) => (
      <AddressCard
        address={item}
        onDelete={handleDelete}
        onSetDefault={handleSetDefault}
        styles={styles}
        colors={colors}
      />
    ),
    [handleDelete, handleSetDefault, styles, colors],
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          onPress={() => router.push('/addresses/new' as never)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </Pressable>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderAddress}
        contentContainerStyle={styles.listContent}
        refreshControl={(
          <RefreshControl
            refreshing={isFetching}
            tintColor={colors.accent}
            onRefresh={fetchAddresses}
          />
        )}
        ListHeaderComponent={(
          <Text style={styles.title}>Mis Direcciones</Text>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            {isFetching ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <Ionicons name="location-outline" size={48} color={colors.muted} />
                <Text style={styles.emptyTitle}>Sin direcciones</Text>
                <Text style={styles.emptyText}>Agrega una dirección de entrega para tus pedidos.</Text>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.emptyAddButton, pressed && styles.pressed]}
                  onPress={() => router.push('/addresses/new' as never)}
                >
                  <Text style={styles.emptyAddButtonText}>Agregar dirección</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function AddressCard({
  address,
  onDelete,
  onSetDefault,
  styles,
  colors,
}: {
  address: Address;
  onDelete: (address: Address) => void;
  onSetDefault: (address: Address) => void;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  const lines = [
    address.streetAddress,
    address.apartment,
    `${address.city}, ${address.stateProvince} ${address.postalCode}`,
    address.country,
  ].filter(Boolean);

  return (
    <View style={styles.addressCard}>
      <View style={styles.addressBody}>
        {address.isDefault ? (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Predeterminada</Text>
          </View>
        ) : null}

        {lines.map((line, i) => (
          <Text
            key={i}
            style={i === 0 ? styles.addressStreet : styles.addressLine}
            numberOfLines={2}
          >
            {line}
          </Text>
        ))}

        {address.phone ? (
          <Text style={styles.addressPhone}>{address.phone}</Text>
        ) : null}
      </View>

      <View style={styles.addressActions}>
        {!address.isDefault ? (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            onPress={() => onSetDefault(address)}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.accent} />
            <Text style={[styles.actionButtonText, { color: colors.accent }]}>Predeterminada</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          onPress={() => onDelete(address)}
        >
          <Ionicons name="trash-outline" size={16} color="#DC2626" />
          <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      gap: Spacing.two,
    },
    backButton: {
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
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
      minHeight: 36,
      justifyContent: 'center',
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.accent,
    },
    addButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: '#ffffff',
    },
    listContent: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.six,
      gap: Spacing.two,
    },
    title: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: colors.foreground,
      marginBottom: Spacing.two,
    },
    addressCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      padding: Spacing.three,
      gap: Spacing.two,
      backgroundColor: colors.background,
    },
    addressBody: {
      gap: Spacing.one,
    },
    defaultBadge: {
      alignSelf: 'flex-start',
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.two,
      paddingVertical: 2,
      backgroundColor: colors.accent,
      marginBottom: Spacing.one,
    },
    defaultBadgeText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: '#ffffff',
    },
    addressStreet: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    addressLine: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    addressPhone: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
      marginTop: Spacing.one,
    },
    addressActions: {
      flexDirection: 'row',
      gap: Spacing.three,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: Spacing.two,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
    },
    actionButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
    },
    emptyState: {
      minHeight: 320,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      padding: Spacing.four,
    },
    emptyTitle: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
    },
    emptyText: {
      maxWidth: 260,
      textAlign: 'center',
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      lineHeight: FontSize.base * 1.45,
      color: colors.muted,
    },
    emptyAddButton: {
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.four,
      backgroundColor: colors.accent,
      marginTop: Spacing.two,
    },
    emptyAddButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: '#ffffff',
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
