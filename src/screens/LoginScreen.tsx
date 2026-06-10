import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n';
import { SIZES } from '../constants/theme';
import { supabase } from '../services/supabase';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Forgot Password fields
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const validate = () => {
    let newErrors: { [key: string]: string } = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address.';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!isLogin) {
      if (!firstName) newErrors.firstName = 'First name is required';
      if (!lastName) newErrors.lastName = 'Last name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validate()) return;
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          let errorMessage = error.message;
          if (errorMessage.includes('Invalid login credentials')) {
            errorMessage = 'Incorrect email or password. Please try again.';
          }
          Alert.alert(t.loginFailed || 'Login Failed', errorMessage);
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { first_name: firstName.trim(), last_name: lastName.trim() },
          },
        });
        if (error) {
          let errorMessage = error.message;
          if (errorMessage.includes('already registered')) {
            errorMessage = 'An account with this email already exists.';
          }
          Alert.alert(t.registrationFailed || 'Registration Failed', errorMessage);
        } else {
          Alert.alert(t.success || 'Success', t.checkEmailLink || 'Check your email for the confirmation link or log in now.');
        }
      }
    } catch (error: any) {
      Alert.alert(t.error || 'Error', error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      Alert.alert(t.error || 'Error', t.invalidEmail || 'Please enter a valid email address.');
      return;
    }
    setResetLoading(true);
    try {
      // TODO: In production, configure deep links in app.json and set Supabase Redirect URL to sublyx://reset-password
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: 'sublyx://reset-password',
      });
      if (error) throw error;
      Alert.alert(t.success || 'Success', t.resetEmailSent || 'Password reset link has been sent to your email. If the link does not open the app during development, use the Password option in Settings after logging in, or configure the Supabase redirect URL.');
      setShowForgotModal(false);
      setResetEmail('');
    } catch (error: any) {
      let errorMessage = error.message;
      if (errorMessage.includes('not found')) {
         errorMessage = 'An account with this email does not exist.';
      }
      Alert.alert(t.error || 'Error', errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  const renderForgotModal = () => (
    <Modal visible={showForgotModal} animationType="slide" transparent={true}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.modalOverlay, { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.background, padding: 24, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24 }]}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: SIZES.fontLarge, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }]}>{t.resetPassword || 'Reset Password'}</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 20, textAlign: 'center' }}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text, marginBottom: 8 }]}
                placeholder="email@example.com"
                placeholderTextColor={colors.textSecondary}
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 16 }]} onPress={handleForgotPassword} disabled={resetLoading}>
                {resetLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{t.sendResetLink || 'Send Reset Link'}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 16, padding: 16, alignItems: 'center' }} onPress={() => setShowForgotModal(false)}>
                <Text style={{ color: colors.text, fontSize: SIZES.fontMedium, fontWeight: 'bold' }}>{t.cancel || 'Cancel'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isLogin ? (t.welcomeBack || 'Welcome Back') : (t.createAccount || 'Create Account')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isLogin ? (t.signInSubtitle || 'Sign in to manage your subscriptions') : (t.signUpSubtitle || 'Sign up to start tracking subscriptions')}
            </Text>

            <View style={styles.form}>
              {!isLogin && (
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.label, { color: colors.text }]}>{t.firstName || 'First Name'}</Text>
                    <TextInput 
                      style={[styles.input, { backgroundColor: colors.card, borderColor: errors.firstName ? colors.danger : colors.border, color: colors.text }]}
                      placeholder="Jane"
                      placeholderTextColor={colors.textSecondary}
                      value={firstName}
                      onChangeText={(t) => { setFirstName(t); setErrors({...errors, firstName: ''}); }}
                    />
                    {errors.firstName && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.firstName}</Text>}
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.label, { color: colors.text }]}>{t.lastName || 'Last Name'}</Text>
                    <TextInput 
                      style={[styles.input, { backgroundColor: colors.card, borderColor: errors.lastName ? colors.danger : colors.border, color: colors.text }]}
                      placeholder="Doe"
                      placeholderTextColor={colors.textSecondary}
                      value={lastName}
                      onChangeText={(t) => { setLastName(t); setErrors({...errors, lastName: ''}); }}
                    />
                    {errors.lastName && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.lastName}</Text>}
                  </View>
                </View>
              )}

              <Text style={[styles.label, { color: colors.text }]}>{t.emailAddress || 'Email Address'}</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, borderColor: errors.email ? colors.danger : colors.border, color: colors.text }]}
                placeholder="email@example.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors({...errors, email: ''}); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.email}</Text>}

              <Text style={[styles.label, { color: colors.text }]}>{t.password || 'Password'}</Text>
              <View style={[styles.passwordContainer, { backgroundColor: colors.card, borderColor: errors.password ? colors.danger : colors.border }]}>
                <TextInput 
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors({...errors, password: ''}); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.password}</Text>}

              {isLogin && (
                <TouchableOpacity style={styles.forgotPassword} onPress={() => setShowForgotModal(true)}>
                  <Text style={[styles.forgotText, { color: colors.primary }]}>{t.forgotPassword || 'Forgot Password?'}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: colors.primary }, !isLogin && { marginTop: 24 }]} 
                onPress={handleAuth}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{isLogin ? (t.signIn || 'Sign In') : (t.signUp || 'Sign Up')}</Text>}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {isLogin ? (t.dontHaveAccount || "Don't have an account? ") : (t.alreadyHaveAccount || "Already have an account? ")}
              </Text>
              <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setErrors({}); }}>
                <Text style={[styles.registerText, { color: colors.primary }]}>{isLogin ? (t.register || 'Register') : (t.signIn || 'Sign In')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {renderForgotModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: SIZES.padding, justifyContent: 'center' },
  headerTitle: { fontSize: SIZES.fontXXLarge, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: SIZES.fontMedium, marginBottom: 40 },
  form: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: SIZES.fontSmall, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: SIZES.radius, padding: 16, marginBottom: 8, fontSize: SIZES.fontMedium },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: SIZES.radius, marginBottom: 8 },
  passwordInput: { flex: 1, padding: 16, fontSize: SIZES.fontMedium },
  eyeIcon: { padding: 16 },
  errorText: { fontSize: 12, marginBottom: 12, marginTop: -4 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24, marginTop: 8 },
  forgotText: { fontSize: SIZES.fontSmall, fontWeight: '600' },
  primaryButton: { paddingVertical: 16, borderRadius: SIZES.radius, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: SIZES.fontMedium, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: SIZES.fontMedium },
  registerText: { fontSize: SIZES.fontMedium, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { fontSize: SIZES.fontLarge, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
});
