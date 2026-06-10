import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n';
import { SIZES } from '../constants/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function HelpCenterScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.helpCenter || 'Help Center'}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t.helpTitle1 || 'How to add a subscription'}</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {t.helpText1 || 'Go to the Subscriptions tab and tap the "+ Add" button at the top right. Fill out the service name, price, and start date.'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t.helpTitle2 || 'How to edit or delete a subscription'}</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {t.helpText2 || 'Tap on any existing subscription in your list to open the Edit screen. You can modify its details or scroll down to tap "Delete Subscription".'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t.helpTitle3 || 'How Dashboard analytics are calculated'}</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {t.helpText3 || 'The dashboard automatically converts weekly and yearly subscriptions into their monthly equivalent to provide an accurate monthly spending chart.'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t.helpTitle4 || 'How Calendar shows upcoming payments'}</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {t.helpText4 || 'The calendar dynamically sorts your subscriptions chronologically based on their next billing date.'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t.helpTitle5 || 'How to change profile photo'}</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {t.helpText5 || 'Navigate to the Profile screen and tap the camera icon next to your avatar to upload a new photo from your gallery.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: SIZES.padding, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerTitle: { fontSize: SIZES.fontXLarge, fontWeight: 'bold' },
  content: { padding: SIZES.padding, paddingBottom: 80 },
  card: { padding: 16, borderRadius: SIZES.radius, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  sectionTitle: { fontSize: SIZES.fontMedium, fontWeight: 'bold', marginBottom: 8 },
  paragraph: { fontSize: SIZES.fontSmall, lineHeight: 20 },
});
