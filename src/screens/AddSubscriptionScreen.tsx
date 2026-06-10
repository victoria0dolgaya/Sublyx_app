import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator, Modal, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { SIZES } from '../constants/theme';
import { supabase } from '../services/supabase';
import dayjs from 'dayjs';
import { CATEGORY_COLORS } from './DashboardScreen';
import { Calendar } from 'lucide-react-native';

const CATEGORIES = Object.keys(CATEGORY_COLORS);
const CURRENCIES = ['USD', 'GBP', 'EUR', 'UAH'];

export default function AddSubscriptionScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [currency, setCurrency] = useState('USD');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState('');
  
  const [reminderDays, setReminderDays] = useState(profile?.default_reminder_days || 1);
  const [reminderRepeat, setReminderRepeat] = useState(profile?.default_reminder_repeat || 1);
  
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showCatModal, setShowCatModal] = useState(false);
  const [showCurModal, setShowCurModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState<'start' | 'end' | null>(null);

  const handleSave = async () => {
    if (!serviceName || !price) {
      Alert.alert(t.error || 'Error', t.fillAllFields || 'Please fill all fields.');
      return;
    }
    
    if (!user) return;
    setLoading(true);

    try {
      const trimmedName = serviceName.trim().toLowerCase();
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id, service_name')
        .eq('user_id', user.id);
        
      if (existing && existing.some(sub => sub.service_name.trim().toLowerCase() === trimmedName)) {
        Alert.alert(t.error || 'Error', t.subscriptionExists || 'This subscription already exists.');
        setLoading(false);
        return;
      }

      const nextDate = dayjs(startDate).add(1, billingCycle === 'monthly' ? 'month' : billingCycle === 'yearly' ? 'year' : 'week').format('YYYY-MM-DD');

      const { error } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        service_name: serviceName,
        category: category,
        price: parseFloat(price),
        currency: currency,
        billing_cycle: billingCycle,
        first_payment_date: startDate,
        next_payment_date: nextDate,
        end_date: endDate ? endDate : null,
        reminder_days_before: reminderDays,
        reminder_repeat_count: reminderRepeat
      });

      if (error) throw error;
      Alert.alert(t.success || 'Success', t.subscriptionSaved || 'Subscription saved!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t.error || 'Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryModal = () => (
    <Modal visible={showCatModal} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{t.category}</Text>
          <FlatList 
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.modalItem, { borderBottomColor: colors.border }]} onPress={() => { setCategory(item); setShowCatModal(false); }}>
                <View style={[styles.colorCircle, { backgroundColor: CATEGORY_COLORS[item] }]} />
                <Text style={[styles.modalItemText, { color: colors.text }]}>{(t as any)[`cat${item.replace(/\s+/g, '')}`] || item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.card }]} onPress={() => setShowCatModal(false)}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>{t.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderCurrencyModal = () => (
    <Modal visible={showCurModal} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{t.currency}</Text>
          <FlatList 
            data={CURRENCIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.modalItem, { borderBottomColor: colors.border }]} onPress={() => { setCurrency(item); setShowCurModal(false); }}>
                <Text style={[styles.modalItemText, { color: colors.text, textAlign: 'center', width: '100%' }]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderDateModal = () => {
    const days = Array.from({length: 60}, (_, i) => i - 30); 
    return (
      <Modal visible={!!showDateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, height: 400 }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {showDateModal === 'start' ? t.startDate : t.endDate}
            </Text>
            
            {showDateModal === 'end' && (
              <TouchableOpacity style={[styles.modalItem, { borderBottomColor: colors.border }]} onPress={() => { setEndDate(''); setShowDateModal(null); }}>
                <Text style={[styles.modalItemText, { color: colors.danger, fontWeight: 'bold' }]}>{t.ongoing}</Text>
              </TouchableOpacity>
            )}

            <FlatList 
              data={days}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => {
                const dateStr = dayjs().add(item, 'day').format('YYYY-MM-DD');
                const displayStr = dayjs().add(item, 'day').format('MMM D, YYYY');
                return (
                  <TouchableOpacity style={[styles.modalItem, { borderBottomColor: colors.border }]} onPress={() => { 
                      if (showDateModal === 'start') setStartDate(dateStr);
                      else setEndDate(dateStr);
                      setShowDateModal(null); 
                    }}>
                    <Text style={[styles.modalItemText, { color: colors.text }]}>{item === 0 ? `Today (${displayStr})` : displayStr}</Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.card }]} onPress={() => setShowDateModal(null)}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.inner}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{t.addSubscription}</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{ color: colors.primary, fontSize: SIZES.fontMedium, fontWeight: 'bold' }}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={[styles.label, { color: colors.text }]}>{t.serviceName}</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} value={serviceName} onChangeText={setServiceName} placeholderTextColor={colors.textSecondary} />

              <Text style={[styles.label, { color: colors.text }]}>{t.price} & {t.currency}</Text>
              <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                <TouchableOpacity style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, marginRight: 8, justifyContent: 'center', marginBottom: 0, height: 56, width: 70, alignItems: 'center' }]} onPress={() => setShowCurModal(true)}>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>{currency}</Text>
                </TouchableOpacity>
                <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text, flex: 1, marginBottom: 0, height: 56 }]} keyboardType="numeric" value={price} onChangeText={setPrice} placeholderTextColor={colors.textSecondary} />
              </View>

              <Text style={[styles.label, { color: colors.text }]}>{t.category}</Text>
              <TouchableOpacity style={[styles.pickerButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowCatModal(true)}>
                <View style={[styles.colorCircle, { backgroundColor: CATEGORY_COLORS[category] }]} />
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>{(t as any)[`cat${category.replace(/\s+/g, '')}`] || category}</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: colors.text }]}>{t.billingCycle}</Text>
              <View style={styles.cycleRow}>
                <TouchableOpacity style={[styles.cycleBtn, { backgroundColor: colors.card, borderColor: colors.border }, billingCycle === 'monthly' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]} onPress={() => setBillingCycle('monthly')}>
                  <Text style={[styles.cycleBtnText, { color: colors.textSecondary }, billingCycle === 'monthly' && { color: colors.primary }]}>{t.monthly}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cycleBtn, { backgroundColor: colors.card, borderColor: colors.border }, billingCycle === 'yearly' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]} onPress={() => setBillingCycle('yearly')}>
                  <Text style={[styles.cycleBtnText, { color: colors.textSecondary }, billingCycle === 'yearly' && { color: colors.primary }]}>{t.yearly}</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.text }]}>{t.startDate}</Text>
              <TouchableOpacity style={[styles.pickerButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowDateModal('start')}>
                <Calendar color={colors.textSecondary} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>{dayjs(startDate).format('MMM D, YYYY')}</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: colors.text }]}>{t.endDate}</Text>
              <TouchableOpacity style={[styles.pickerButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowDateModal('end')}>
                <Calendar color={colors.textSecondary} size={20} style={{ marginRight: 12 }} />
                <Text style={[styles.pickerButtonText, { color: endDate ? colors.text : colors.textSecondary }]}>{endDate ? dayjs(endDate).format('MMM D, YYYY') : t.ongoing}</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>{t.reminderDaysBefore}</Text>
              <View style={styles.cycleRow}>
                {[1, 3, 5, 7].map(d => (
                  <TouchableOpacity key={d} style={[styles.cycleBtn, { backgroundColor: colors.card, borderColor: colors.border }, reminderDays === d && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]} onPress={() => setReminderDays(d)}>
                    <Text style={[styles.cycleBtnText, { color: colors.textSecondary }, reminderDays === d && { color: colors.primary }]}>{d} {t.days}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>{t.repeatCount || 'Repeat Count'}</Text>
              <View style={styles.cycleRow}>
                {[1, 2, 3].map(c => (
                  <TouchableOpacity key={c} style={[styles.cycleBtn, { backgroundColor: colors.card, borderColor: colors.border }, reminderRepeat === c && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]} onPress={() => setReminderRepeat(c)}>
                    <Text style={[styles.cycleBtnText, { color: colors.textSecondary }, reminderRepeat === c && { color: colors.primary }]}>{c === 1 ? (t.once || 'Once') : c === 2 ? (t.twice || 'Twice') : (t.threeTimes || '3 Times')}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 16 }]} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{t.saveSubscription}</Text>}
              </TouchableOpacity>
              <View style={{ height: 100 }} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {renderCategoryModal()}
      {renderCurrencyModal()}
      {renderDateModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingBottom: 80 },
  header: { padding: SIZES.padding, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: SIZES.fontXLarge, fontWeight: 'bold' },
  form: { paddingHorizontal: SIZES.padding },
  label: { fontSize: SIZES.fontSmall, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: SIZES.radius, padding: 16, marginBottom: 20, fontSize: SIZES.fontMedium },
  pickerButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: SIZES.radius, padding: 16, marginBottom: 20 },
  colorCircle: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  pickerButtonText: { fontSize: SIZES.fontMedium },
  cycleRow: { flexDirection: 'row', marginBottom: 20 },
  cycleBtn: { flex: 1, padding: 12, alignItems: 'center', borderWidth: 1, marginRight: 8, borderRadius: SIZES.radius },
  cycleBtnText: { fontWeight: '600', fontSize: 12 },
  primaryButton: { paddingVertical: 16, borderRadius: SIZES.radius, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: SIZES.fontMedium, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: SIZES.fontLarge, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  modalItemText: { fontSize: SIZES.fontMedium },
  closeButton: { marginTop: 16, padding: 16, borderRadius: SIZES.radius, alignItems: 'center' },
  closeButtonText: { fontSize: SIZES.fontMedium, fontWeight: 'bold' }
});
