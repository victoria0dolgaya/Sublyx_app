import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { mockCategories } from '../data/mockData';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const chartData = mockCategories.map((c) => ({
    name: c.category,
    population: c.amount,
    color: c.color,
    legendFontColor: COLORS.light.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Analytics</Text>
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Spending by Category</Text>
        <PieChart
          data={chartData}
          width={screenWidth - SIZES.padding * 2}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
    padding: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.fontXLarge,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SIZES.padding,
  },
  chartContainer: {
    backgroundColor: COLORS.light.card,
    borderRadius: SIZES.cardRadius,
    padding: SIZES.padding,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    color: COLORS.light.text,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
});
