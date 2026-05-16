import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/modules/auth';

type MenuItemProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
};

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = user
    ? `${user.name?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mi Perfil</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {user ? (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name} {user.lastName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Mi cuenta</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="heart-outline"
              label="Mi Wishlist"
              onPress={() => router.push('/wishlist' as never)}
              styles={styles}
              colors={colors}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="receipt-outline"
              label="Mis Pedidos"
              onPress={() => router.push('/orders' as never)}
              styles={styles}
              colors={colors}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="location-outline"
              label="Mis Direcciones"
              disabled
              styles={styles}
              colors={colors}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="lock-closed-outline"
              label="Cambiar contraseña"
              disabled
              styles={styles}
              colors={colors}
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress, disabled, styles, colors }: MenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.menuItem,
        disabled && styles.menuItemDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={disabled ? colors.muted : colors.foreground} />
      <Text style={[styles.menuItemLabel, disabled && styles.menuItemLabelDisabled]}>{label}</Text>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={disabled ? colors.border : colors.muted}
        style={styles.menuChevron}
      />
    </Pressable>
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
    title: {
      paddingTop: Spacing.two,
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: colors.foreground,
    },
    avatarSection: {
      alignItems: 'center',
      gap: Spacing.three,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['2xl'],
      color: '#ffffff',
    },
    userInfo: {
      alignItems: 'center',
      gap: Spacing.one,
    },
    userName: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
    },
    userEmail: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    menuSection: {
      gap: Spacing.two,
    },
    menuSectionTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    menuCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      padding: Spacing.three,
      minHeight: 52,
      backgroundColor: colors.background,
    },
    menuItemDisabled: {
      opacity: 0.5,
    },
    menuItemLabel: {
      flex: 1,
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    menuItemLabelDisabled: {
      color: colors.muted,
    },
    menuChevron: {
      marginLeft: 'auto',
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: Spacing.three + 20 + Spacing.three,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      minHeight: 48,
      borderWidth: 1,
      borderColor: '#FCA5A5',
      borderRadius: Radius.md,
      backgroundColor: '#FEF2F2',
    },
    logoutText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: '#DC2626',
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
