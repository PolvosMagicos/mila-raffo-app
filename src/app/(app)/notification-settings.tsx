import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useNotificationsStore } from '@/modules/notifications';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const notifyOffers = useNotificationsStore((s) => s.notifyOffers);
  const notifyOrders = useNotificationsStore((s) => s.notifyOrders);
  const isLoading = useNotificationsStore((s) => s.isLoading);
  const fetchPreferences = useNotificationsStore((s) => s.fetchPreferences);
  const updatePreferences = useNotificationsStore((s) => s.updatePreferences);

  useEffect(() => {
    void fetchPreferences();
  }, [fetchPreferences]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={styles.title}>Notificaciones</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <View style={styles.card}>
            <SettingRow
              icon="pricetag-outline"
              label="Ofertas y promociones"
              description="Enterate cuando hay nuevas ofertas"
              value={notifyOffers}
              onValueChange={(v) => void updatePreferences({ notifyOffers: v })}
              loading={isLoading}
              colors={colors}
              styles={styles}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="cube-outline"
              label="Estado de pedidos"
              description="Actualizaciones de tus compras"
              value={notifyOrders}
              onValueChange={(v) => void updatePreferences({ notifyOrders: v })}
              loading={isLoading}
              colors={colors}
              styles={styles}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type RowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  loading: boolean;
  colors: typeof Colors.light | typeof Colors.dark;
  styles: ReturnType<typeof createStyles>;
};

function SettingRow({ icon, label, description, value, onValueChange, loading, colors, styles }: RowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIconBox}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="#ffffff"
        />
      )}
    </View>
  );
}

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.six,
      gap: Spacing.four,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingTop: Spacing.two,
    },
    backBtn: {
      padding: Spacing.one,
    },
    title: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: colors.foreground,
    },
    section: {
      gap: Spacing.two,
    },
    sectionTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      minHeight: 64,
    },
    rowIconBox: {
      width: 20,
      alignItems: 'center',
    },
    rowText: {
      flex: 1,
      gap: 2,
    },
    rowLabel: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    rowDescription: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: Spacing.three + 20 + Spacing.three,
    },
  });
}
