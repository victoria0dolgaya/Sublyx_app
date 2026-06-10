import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { SIZES } from '../constants/theme';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../services/supabase';

export default function PasswordScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const verifyCurrentPassword = async () => {
    if (!currentPassword) {
      Alert.alert(t.error || 'Error', t.fillAllFields);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });
      if (error) throw error;
      setVerified(true);
    } catch (error: any) {
      Alert.alert(t.error || 'Verification Failed', 'Incorrect current password.');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', t.fillAllFields);
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', t.passwordMinLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t.error || 'Error', t.passwordsNotMatch || 'New passwords do not match.');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Alert.alert(t.success || 'Success', 'Password updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.password}</Text>
      </View>
      
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
        {!verified ? (
          <>
            <Text style={[styles.label, { color: colors.text }]}>{t.currentPassword || 'Current Password'}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={verifyCurrentPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{t.verifyPassword || 'Verify Password'}</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>{t.confirmPassword || 'Confirm New Password'}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={updatePassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{t.changePassword || 'Update Password'}</Text>}
            </TouchableOpacity>
          </>
        )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: SIZES.padding, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerTitle: { fontSize: SIZES.fontXLarge, fontWeight: 'bold' },
  content: { padding: SIZES.padding },
  label: { fontSize: SIZES.fontSmall, fontWeight: '600', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: SIZES.radius, paddingHorizontal: 16, marginBottom: 20 },
  input: { flex: 1, paddingVertical: 16, fontSize: SIZES.fontMedium },
  primaryButton: { paddingVertical: 16, borderRadius: SIZES.radius, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontSize: SIZES.fontMedium, fontWeight: 'bold' },
});
