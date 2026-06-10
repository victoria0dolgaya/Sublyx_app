import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { SIZES } from '../constants/theme';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../services/supabase';

export default function ReminderPreferencesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user, profile, refreshProfile } = useAuth();

  const [reminderDays, setReminderDays] = useState(profile?.default_reminder_days || 1);
  const [reminderRepeat, setReminderRepeat] = useState(profile?.default_reminder_repeat || 1);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        default_reminder_days: reminderDays,
        default_reminder_repeat: reminderRepeat
      }).eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      Alert.alert(t.success || 'Success', t.savePreferences || 'Reminder preferences saved.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t.error || 'Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.reminderPreferences}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={{ color: colors.textSecondary, marginBottom: 24, fontSize: 13, lineHeight: 18 }}>
          {t.reminderPrefExplanation || 'These settings are used as default values for newly created subscriptions. You can still customize reminders individually for each subscription.'}
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>{t.defaultReminderDays || 'Default Reminder Days Before Payment'}</Text>
        <View style={styles.row}>
          {[1, 3, 5, 7].map(d => (
            <TouchableOpacity key={d} style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }, reminderDays === d && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]} onPress={() => setReminderDays(d)}>
              <Text style={[styles.btnText, { color: colors.textSecondary }, reminderDays === d && { color: colors.primary }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text, marginTop: 24 }]}>{t.defaultRepeatCount || 'Default Repeat Count'}</Text>
        <View style={styles.row}>
          {[1, 2, 3].map(c => (
            <TouchableOpacity key={c} style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }, reminderRepeat === c && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]} onPress={() => setReminderRepeat(c)}>
              <Text style={[styles.btnText, { color: colors.textSecondary }, reminderRepeat === c && { color: colors.primary }]}>{c === 1 ? (t.once || 'Once') : c === 2 ? (t.twice || 'Twice') : (t.threeTimes || '3 Times')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 40 }]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{t.savePreferences || 'Save Preferences'}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: SIZES.padding, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerTitle: { fontSize: SIZES.fontXLarge, fontWeight: 'bold' },
  content: { padding: SIZES.padding },
  label: { fontSize: SIZES.fontSmall, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row' },
  btn: { flex: 1, paddingVertical: 16, alignItems: 'center', borderWidth: 1, marginRight: 8, borderRadius: SIZES.radius },
  btnText: { fontWeight: '600', fontSize: SIZES.fontMedium },
  primaryButton: { paddingVertical: 16, borderRadius: SIZES.radius, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: SIZES.fontMedium, fontWeight: 'bold' },
});
