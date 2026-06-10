import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { SIZES } from '../constants/theme';
import { supabase } from '../services/supabase';
import dayjs from 'dayjs';
import { useFocusEffect } from '@react-navigation/native';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', UAH: '₴' };

export default function CalendarScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubscriptions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);
      
    if (!error && data) {
      const sorted = data.sort((a, b) => dayjs(a.next_payment_date).valueOf() - dayjs(b.next_payment_date).valueOf());
      setSubscriptions(sorted);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.upcomingPayments}</Text>
        <View style={{ paddingHorizontal: SIZES.padding }}>
          <Skeleton height={70} borderRadius={SIZES.radius} style={{ marginBottom: 12 }} />
          <Skeleton height={70} borderRadius={SIZES.radius} style={{ marginBottom: 12 }} />
          <Skeleton height={70} borderRadius={SIZES.radius} style={{ marginBottom: 12 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>{t.upcomingPayments}</Text>
      
      {subscriptions.length === 0 ? (
        <EmptyState 
          title={t.upcomingPayments}
          description={t.noUpcomingPayments}
          onPressAdd={() => navigation.navigate('AddSubscription')}
        />
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => {
            const daysLeft = dayjs(item.next_payment_date).diff(dayjs(), 'day');
            return (
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={[styles.dateBox, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.dateMonth, { color: colors.primary }]}>{(t as any)[dayjs(item.next_payment_date).format('MMM').toLowerCase()] || dayjs(item.next_payment_date).format('MMM')}</Text>
                  <Text style={[styles.dateDay, { color: colors.primary }]}>{dayjs(item.next_payment_date).format('DD')}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.service_name}</Text>
                  <Text style={[styles.daysLeft, { color: colors.textSecondary }]}>
                    {daysLeft > 0 ? t.inDays?.replace('{{days}}', String(daysLeft)) || `in ${daysLeft} days` : daysLeft === 0 ? t.today : t.overdue}
                  </Text>
                </View>
                <Text style={[styles.price, { color: colors.text }]}>
                  {CURRENCY_SYMBOLS[item.currency] || '$'}{Number(item.price).toFixed(2)}
                </Text>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: SIZES.fontXLarge, fontWeight: 'bold', padding: SIZES.padding },
  listContent: { paddingHorizontal: SIZES.padding, paddingBottom: 120 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: SIZES.radius, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  dateBox: { padding: 10, borderRadius: 12, alignItems: 'center', width: 50 },
  dateMonth: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  dateDay: { fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: SIZES.fontMedium, fontWeight: '600' },
  daysLeft: { fontSize: SIZES.fontSmall, marginTop: 4 },
  price: { fontSize: SIZES.fontMedium, fontWeight: 'bold' },
});
