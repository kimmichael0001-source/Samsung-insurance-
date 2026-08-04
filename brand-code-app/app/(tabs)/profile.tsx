import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../src/components';
import { demoUser } from '../../src/data/user';
import { colors, radius, spacing, typography } from '../../src/theme';

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
  rightElement,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <Pressable style={styles.actionRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.actionLeft}>
        <Ionicons name={icon} size={18} color={colors.textPrimary} />
        <Text style={styles.actionLabel}>{label}</Text>
      </View>
      {rightElement ?? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSupportPress = (topic: string) => {
    Alert.alert(topic, 'Этот раздел использует демонстрационные данные и появится в следующих версиях приложения.');
  };

  const handleLogout = () => {
    Alert.alert('Выход', 'Это демонстрационный профиль без настоящей авторизации.', [
      { text: 'Понятно', style: 'default' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Профиль" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{demoUser.name.charAt(0)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{demoUser.name}</Text>
            <Text style={styles.userTag}>Демонстрационный профиль</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контактные данные</Text>
          <View style={styles.card}>
            <InfoRow icon="call-outline" label="Телефон" value={demoUser.phone} />
            <View style={styles.divider} />
            <InfoRow icon="location-outline" label="Город" value={demoUser.city} />
            <View style={styles.divider} />
            <InfoRow icon="home-outline" label="Адрес доставки" value={demoUser.deliveryAddress} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки</Text>
          <View style={styles.card}>
            <ActionRow
              icon="notifications-outline"
              label="Уведомления"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={colors.surface}
                />
              }
            />
            <View style={styles.divider} />
            <ActionRow icon="language-outline" label="Язык интерфейса" rightElement={<Text style={styles.valueTag}>Русский</Text>} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Поддержка</Text>
          <View style={styles.card}>
            <ActionRow icon="help-circle-outline" label="Частые вопросы" onPress={() => handleSupportPress('Частые вопросы')} />
            <View style={styles.divider} />
            <ActionRow icon="chatbubble-ellipses-outline" label="Написать в поддержку" onPress={() => handleSupportPress('Поддержка')} />
            <View style={styles.divider} />
            <ActionRow icon="information-circle-outline" label="О приложении CODE" onPress={() => handleSupportPress('О приложении CODE')} />
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </Pressable>

        <Text style={styles.footerNote}>CODE · MVP-версия · демонстрационные данные</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: 22,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
  },
  userTag: {
    ...typography.caption,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  infoIcon: {
    width: 32,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    ...typography.small,
  },
  infoValue: {
    ...typography.body,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionLabel: {
    ...typography.body,
  },
  valueTag: {
    ...typography.caption,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.dangerMuted,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  footerNote: {
    ...typography.small,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
