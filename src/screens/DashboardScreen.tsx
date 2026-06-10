import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { SIZES } from '../constants/theme';
import { supabase } from '../services/supabase';
import { PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const screenWidth = Dimensions.get('window').width;

export const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#E50914',
  Education: '#0056D2',
  Work: '#F59E0B',
  Business: '#3B82F6',
  House: '#10B981',
  Music: '#1DB954',
  Productivity: '#10A37F',
  Storage: '#4285F4',
  'AI Tools': '#8A2BE2',
  Other: '#6B7280'
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  UAH: '₴'
};

export default function DashboardScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllSubs, setShowAllSubs] = useState(false);

  const fetchSubscriptions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);
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

  const calculateMonthly = () => {
    return subscriptions.reduce((acc, sub) => {
      if (sub.billing_cycle === 'yearly') return acc + (sub.price / 12);
      if (sub.billing_cycle === 'weekly') return acc + (sub.price * 4.33);
      return acc + Number(sub.price);
    }, 0);
  };

  const totalMonthly = calculateMonthly();
  const yearlyForecast = totalMonthly * 12;

  // Determine dominant currency
  const currencyCounts: Record<string, number> = {};
  subscriptions.forEach(sub => {
    const c = sub.currency || 'USD';
    currencyCounts[c] = (currencyCounts[c] || 0) + 1;
  });
  let dominantCurrency = 'USD';
  let maxCount = 0;
  Object.keys(currencyCounts).forEach(c => {
    if (currencyCounts[c] > maxCount) {
      maxCount = currencyCounts[c];
      dominantCurrency = c;
    }
  });
  const dominantSymbol = CURRENCY_SYMBOLS[dominantCurrency] || '$';
  const hasMixedCurrencies = Object.keys(currencyCounts).length > 1;

  // Group by category for Chart
  const categoryTotals: Record<string, number> = {};
  subscriptions.forEach(sub => {
    const monthlyCost = sub.billing_cycle === 'yearly' ? sub.price / 12 : sub.billing_cycle === 'weekly' ? sub.price * 4.33 : Number(sub.price);
    categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + monthlyCost;
  });

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    const pct = (value / total) * 100;
    return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(2)}%`;
  };

  const chartData = Object.keys(categoryTotals).map(cat => ({
    name: `${(t as any)[`cat${cat.replace(/\s+/g, '')}`] || cat} — ${formatPercentage(categoryTotals[cat], totalMonthly)}`,
    population: categoryTotals[cat],
    color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other,
    legendFontColor: colors.textSecondary,
    legendFontSize: 11,
  }));

  const getInsight = () => {
    if (subscriptions.length === 0) return t.noSubscriptions;
    let topCategory = '';
    let max = 0;
    Object.keys(categoryTotals).forEach(cat => {
      if (categoryTotals[cat] > max) { max = categoryTotals[cat]; topCategory = cat; }
    });
    
    if (max === 0 || totalMonthly === 0) return t.noSubscriptions;
    
    const percentageString = formatPercentage(max, totalMonthly);
    return t.insightLargestPart?.replace('{{category}}', (t as any)[`cat${topCategory.replace(/\s+/g, '')}`] || topCategory).replace('{{percent}}', percentageString) || `${topCategory} takes the largest part...`;
  };

  const activeSubsToDisplay = showAllSubs ? subscriptions : subscriptions.slice(0, 3);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.scrollContent}>
          <Skeleton height={40} width={150} style={{ marginBottom: 24 }} />
          <View style={styles.summaryRow}>
            <Skeleton height={100} style={{ flex: 1, marginRight: 8, borderRadius: SIZES.cardRadius }} />
            <Skeleton height={100} style={{ flex: 1, borderRadius: SIZES.cardRadius }} />
          </View>
          <Skeleton height={30} width={200} style={{ marginBottom: 16 }} />
          <Skeleton height={200} borderRadius={SIZES.radius} style={{ marginBottom: 24 }} />
          <Skeleton height={80} borderRadius={SIZES.radius} style={{ marginBottom: 12 }} />
          <Skeleton height={80} borderRadius={SIZES.radius} style={{ marginBottom: 12 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text, paddingHorizontal: SIZES.padding }]}>{t.dashboard}</Text>
        <EmptyState 
          title={t.dashboard}
          description={t.noSubscriptions}
          onPressAdd={() => navigation.navigate('AddSubscription')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.dashboard}</Text>
        
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <Text style={[styles.summaryLabel, { color: colors.primaryLight }]}>{t.totalMonthly}</Text>
            <Text style={[styles.summaryValue, { color: '#fff' }]}>{dominantSymbol}{totalMonthly.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.yearlyForecast}</Text>
            <Text style={[styles.summaryValue, { color: colors.text, fontSize: 24 }]}>{dominantSymbol}{yearlyForecast.toFixed(2)}</Text>
          </View>
        </View>

        {hasMixedCurrencies && (
          <Text style={[styles.mixedCurrencyNote, { color: colors.warning }]}>
            {t.mixedCurrencyNote}
          </Text>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.analyticsInsights}</Text>
        <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.insightText, { color: colors.text }]}>{getInsight()}</Text>
          {chartData.length > 0 && (
            <View style={{ alignItems: 'center' }}>
              <PieChart
                data={chartData}
                width={screenWidth - SIZES.padding * 2 - 32}
                height={160}
                chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"0"}
                center={[screenWidth / 4, 0]}
                absolute
                hasLegend={false}
              />
              <View style={{ width: '100%', marginTop: 16 }}>
                {chartData.map((item, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.color, marginRight: 8 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
          {t.activeSubscriptions} ({subscriptions.length})
        </Text>
        
        {activeSubsToDisplay.map((sub) => (
          <View key={sub.id} style={[styles.subCard, { backgroundColor: colors.card }]}>
            <View style={[styles.colorIndicator, { backgroundColor: CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.Other }]} />
            <View style={styles.subInfo}>
              <Text style={[styles.subName, { color: colors.text }]}>{sub.service_name}</Text>
              <Text style={[styles.subCategory, { color: colors.textSecondary }]}>{(t as any)[`cat${sub.category.replace(/\s+/g, '')}`] || sub.category}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.subPrice, { color: colors.text }]}>
                {CURRENCY_SYMBOLS[sub.currency] || '$'}{Number(sub.price).toFixed(2)}
              </Text>
              <Text style={[styles.subCycle, { color: colors.textSecondary }]}>
                /{sub.billing_cycle === 'monthly' ? (t.mo || 'mo') : sub.billing_cycle === 'yearly' ? (t.yr || 'yr') : (t.wk || 'wk')}
              </Text>
            </View>
          </View>
        ))}

        {subscriptions.length > 3 && (
          <TouchableOpacity 
            style={[styles.moreButton, { borderColor: colors.border }]}
            onPress={() => setShowAllSubs(!showAllSubs)}
          >
            <Text style={[styles.moreButtonText, { color: colors.textSecondary }]}>
              {showAllSubs ? t.collapse : t.andMore}
            </Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SIZES.padding, paddingBottom: 120 },
  headerTitle: { fontSize: SIZES.fontXXLarge, fontWeight: 'bold', marginBottom: SIZES.padding },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.padding },
  summaryCard: { flex: 1, padding: 16, borderRadius: SIZES.cardRadius, marginRight: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  summaryLabel: { fontSize: SIZES.fontSmall, fontWeight: '600' },
  summaryValue: { fontSize: 32, fontWeight: 'bold', marginTop: 8 },
  mixedCurrencyNote: { fontSize: 12, marginTop: -12, marginBottom: 16, fontStyle: 'italic' },
  sectionTitle: { fontSize: SIZES.fontLarge, fontWeight: 'bold', marginBottom: 12 },
  insightCard: { padding: 16, borderRadius: SIZES.radius, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  insightText: { fontSize: SIZES.fontMedium, lineHeight: 22, marginBottom: 16 },
  subCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: SIZES.radius, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  colorIndicator: { width: 12, height: 40, borderRadius: 6, marginRight: 12 },
  subInfo: { flex: 1 },
  subName: { fontSize: SIZES.fontMedium, fontWeight: '600' },
  subCategory: { fontSize: SIZES.fontSmall, marginTop: 4 },
  priceContainer: { alignItems: 'flex-end' },
  subPrice: { fontSize: SIZES.fontMedium, fontWeight: 'bold' },
  subCycle: { fontSize: SIZES.fontSmall, marginTop: 2 },
  moreButton: { padding: 12, alignItems: 'center', borderWidth: 1, borderRadius: SIZES.radius, marginTop: 4 },
  moreButtonText: { fontSize: SIZES.fontMedium, fontWeight: '600' }
});
