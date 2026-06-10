import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

export default function OnboardingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconPlaceholder}>
          <Text style={styles.iconText}>S</Text>
        </View>
        <Text style={styles.title}>Welcome to Sublyx</Text>
        <Text style={styles.subtitle}>
          Smart digital subscription management. Track your recurring payments easily.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
  },
  iconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: COLORS.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.light.card,
  },
  title: {
    fontSize: SIZES.fontXXLarge,
    fontWeight: 'bold',
    color: COLORS.light.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: SIZES.fontMedium,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  primaryButton: {
    backgroundColor: COLORS.light.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.light.card,
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
  },
});
