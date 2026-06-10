import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
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

export default function SubscriptionsScreen({ navigation }: any) {
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
      .eq('user_id', user.id)
      .order('next_payment_date', { ascending: true });
      
    if (!error && data) {
      setSubscriptions(data);
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
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.subscriptions}</Text>
        </View>
        <View style={{ paddingHorizontal: SIZES.padding }}>
          <Skeleton height={80} borderRadius={SIZES.radius} style={{ marginBottom: 12 }} />
          <Skeleton height={80} borderRadius={SIZES.radius} style={{ marginBottom: 12 }} />
          <Skeleton height={80} borderRadius={SIZES.radius} style={{ marginBottom: 12 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.subscriptions}</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddSubscription')}
        >
          <Text style={styles.addButtonText}>{t.add || '+ Add'}</Text>
        </TouchableOpacity>
      </View>
      
      {subscriptions.length === 0 ? (
        <EmptyState 
          title={t.subscriptions}
          description={t.noSubscriptions}
          onPressAdd={() => navigation.navigate('AddSubscription')}
        />
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.subCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('EditSubscription', { subscription: item })}
            >
              <View style={styles.subInfo}>
                <Text style={[styles.subName, { color: colors.text }]}>{item.service_name}</Text>
                <Text style={[styles.subDate, { color: colors.textSecondary }]}>
                  {t.next || 'Next'}: {(t as any)[dayjs(item.next_payment_date).format('MMM').toLowerCase()] || dayjs(item.next_payment_date).format('MMM')} {dayjs(item.next_payment_date).format('D, YYYY')}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={[styles.subPrice, { color: colors.text }]}>
                  {CURRENCY_SYMBOLS[item.currency] || '$'}{Number(item.price).toFixed(2)}
                </Text>
                <Text style={[styles.subCycle, { color: colors.textSecondary }]}>
                  /{item.billing_cycle === 'monthly' ? (t.mo || 'mo') : item.billing_cycle === 'yearly' ? (t.yr || 'yr') : (t.wk || 'wk')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingVertical: SIZES.padding },
  headerTitle: { fontSize: SIZES.fontXLarge, fontWeight: 'bold' },
  addButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  listContent: { paddingHorizontal: SIZES.padding, paddingBottom: 120 },
  subCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: SIZES.radius, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  subInfo: { flex: 1 },
  subName: { fontSize: SIZES.fontMedium, fontWeight: 'bold' },
  subDate: { fontSize: SIZES.fontSmall, marginTop: 4 },
  priceContainer: { alignItems: 'flex-end' },
  subPrice: { fontSize: SIZES.fontMedium, fontWeight: 'bold' },
  subCycle: { fontSize: SIZES.fontSmall },
});
