import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n';
import { SIZES } from '../constants/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyPolicyScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.privacyPolicy || 'Privacy Policy'}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          {t.privacyPolicyText1 || 'Sublyx stores user account data, profile information, and subscription records to provide subscription tracking.'}
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          {t.privacyPolicyText2 || 'User data is stored securely using Supabase. The app does not sell personal data.'}
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          {t.privacyPolicyText3 || 'Users can delete their account data entirely from the Profile screen.'}
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          {t.privacyPolicyText4 || 'Avatar images are stored securely in Supabase Storage and are only used for profile display.'}
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          {t.privacyPolicyText5 || 'This app is created as a diploma project and is intended strictly for educational and personal finance tracking purposes.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: SIZES.padding, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerTitle: { fontSize: SIZES.fontXLarge, fontWeight: 'bold' },
  content: { padding: SIZES.padding, paddingBottom: 80 },
  paragraph: { fontSize: SIZES.fontMedium, lineHeight: 24, marginBottom: 16 },
});
