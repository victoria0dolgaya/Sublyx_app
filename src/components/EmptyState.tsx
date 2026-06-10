import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n';
import { SIZES } from '../constants/theme';
import { FolderOpen } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  onPressAdd: () => void;
}

export default function EmptyState({ title, description, onPressAdd }: EmptyStateProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
        <FolderOpen color={colors.primary} size={48} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onPressAdd}
      >
        <Text style={styles.buttonText}>{t.addFirstSubscription}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    marginTop: 40,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: SIZES.fontMedium,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
  },
});
