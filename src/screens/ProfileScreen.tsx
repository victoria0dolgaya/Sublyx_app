import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, Alert, ActivityIndicator, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { User, Bell, Shield, CircleHelp, LogOut, Camera, Trash2, Globe, Clock, KeyRound, ChevronDown, Edit2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { decode } from 'base64-arraybuffer';

export default function ProfileScreen({ navigation }: any) {
  const { colors, toggleTheme, isDarkMode } = useTheme();
  const { profile, user, refreshProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  
  const [notifications, setNotifications] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const openEditModal = () => {
    setEditFirstName(profile?.first_name || '');
    setEditLastName(profile?.last_name || '');
    setEditEmail(user?.email || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
      Alert.alert('Error', t.fillAllFields || 'Please fill out all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      Alert.alert('Error', t.invalidEmail || 'Invalid email format.');
      return;
    }

    setSavingProfile(true);
    try {
      if (!user) return;

      const newFullName = `${editFirstName.trim()} ${editLastName.trim()}`;

      // Update profiles table
      const { error: profileError } = await supabase.from('profiles').update({
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        full_name: newFullName
      }).eq('id', user.id);

      if (profileError) throw profileError;

      // Update Auth Email if changed
      let emailChangedMsg = '';
      if (editEmail.trim() !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: editEmail.trim() });
        if (authError) throw authError;
        emailChangedMsg = '\n\nPlease check your old/new email for a confirmation link to finalize the email change.';
      }

      await refreshProfile();
      setShowEditModal(false);
      Alert.alert(t.success || 'Success', (t.profileUpdated || 'Profile updated successfully.') + emailChangedMsg);

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(t.logOut, t.logOutConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.logOut, style: 'destructive', onPress: async () => {
        await supabase.auth.signOut();
      }}
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t.deleteAccount,
      t.deleteAccountConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.deleteAccount,
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            setDeleting(true);
            try {
              const { data, error } = await supabase.functions.invoke('delete-user-account');
              if (error) {
                if (error.message.includes('non-2xx') || error.message.includes('not found') || error.message.includes('Failed to fetch')) {
                  throw new Error('Account deletion is not configured yet. Please contact support.');
                }
                throw error;
              }
              if (data?.error) throw new Error(data.error);
              
              Alert.alert(t.accountDeleted || 'Account Deleted', t.accountDeletedMsg || 'Your data has been permanently removed.');
              await supabase.auth.signOut();
            } catch (error: any) {
              Alert.alert(t.error || 'Error', error.message);
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const uploadAvatar = async () => {
    if (!user) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (result.canceled || !result.assets[0].base64) return;
      setUploading(true);

      const ext = result.assets[0].uri.substring(result.assets[0].uri.lastIndexOf('.') + 1);
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(result.assets[0].base64), {
          contentType: `image/${ext}`
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: profileError } = await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
      if (profileError) throw profileError;

      await refreshProfile();
    } catch (error: any) {
      Alert.alert(t.error || 'Upload Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) return `${profile.first_name} ${profile.last_name}`;
    if (profile?.full_name) return profile.full_name;
    if (user?.email) return user.email;
    return 'Sublyx User';
  };

  const displayName = getFullName();

  const getInitials = (name: string) => {
    const split = name.split(' ');
    if (split.length > 1) return (split[0][0] + split[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const renderLangModal = () => (
    <Modal visible={showLangModal} animationType="fade" transparent={true}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLangModal(false)}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{t.language}</Text>
          <TouchableOpacity style={[styles.modalItem, { borderBottomColor: colors.border }]} onPress={() => { setLanguage('en'); setShowLangModal(false); }}>
            <Text style={[styles.modalItemText, { color: colors.text }]}>{t.englishUK || 'English (UK)'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalItem, { borderBottomColor: 'transparent' }]} onPress={() => { setLanguage('uk'); setShowLangModal(false); }}>
            <Text style={[styles.modalItemText, { color: colors.text }]}>{t.ukrainianUA || 'Українська (UA)'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal visible={showEditModal} animationType="slide" transparent={true}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.background, width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingBottom: 24, maxHeight: '85%' }]}>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 0 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t.editProfile || 'Edit Profile'}</Text>
                
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t.firstName || 'First Name'}</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={editFirstName}
                  onChangeText={setEditFirstName}
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.inputLabel, { color: colors.text }]}>{t.lastName || 'Last Name'}</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={editLastName}
                  onChangeText={setEditLastName}
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.inputLabel, { color: colors.text }]}>{t.emailAddress || 'Email Address'}</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.textSecondary}
                />
              </ScrollView>

              <View style={{ paddingTop: 10 }}>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 8 }]} onPress={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{t.saveChanges || 'Save Changes'}</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.card, marginTop: 8 }]} onPress={() => setShowEditModal(false)}>
                  <Text style={[styles.closeButtonText, { color: colors.text }]}>{t.cancel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.settings}</Text>
        
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={uploadAvatar} disabled={uploading}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight }]}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>
                  {getInitials(displayName)}
                </Text>
              </View>
            )}
            <View style={[styles.cameraIcon, { backgroundColor: colors.primary }]}>
              {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Camera size={12} color="#fff" />}
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.profileName, { color: colors.text, marginRight: 8 }]}>{displayName}</Text>
              <TouchableOpacity onPress={openEditModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Edit2 size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {displayName !== user?.email && (
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
            )}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.preferences}</Text>
          
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('ReminderPreferences')}>
            <View style={styles.settingIconText}>
              <Clock color={colors.textSecondary} size={20} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t.reminderPreferences}</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.settingRow, { borderBottomColor: colors.border, paddingVertical: 12 }]}>
            <Text style={[styles.settingText, { color: colors.text, marginLeft: 0 }]}>{t.language}</Text>
            <TouchableOpacity 
              style={[styles.langPill, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
              onPress={() => setShowLangModal(true)}
            >
              <Globe color={colors.primary} size={16} />
              <Text style={[styles.langPillText, { color: colors.primary }]}>{language === 'uk' ? 'UA' : 'UK'}</Text>
              <ChevronDown color={colors.primary} size={16} />
            </TouchableOpacity>
          </View>

          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingIconText}>
              <Bell color={colors.textSecondary} size={20} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t.pushNotifications}</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: colors.primary }} />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: 'transparent' }]}>
            <View style={styles.settingIconText}>
              <User color={colors.textSecondary} size={20} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t.darkMode}</Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ true: colors.primary }} />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.support}</Text>
          
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('Password')}>
            <View style={styles.settingIconText}>
              <KeyRound color={colors.textSecondary} size={20} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t.password}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <View style={styles.settingIconText}>
              <Shield color={colors.textSecondary} size={20} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t.privacyPolicy}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: 'transparent' }]} onPress={() => navigation.navigate('HelpCenter')}>
            <View style={styles.settingIconText}>
              <CircleHelp color={colors.textSecondary} size={20} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t.helpCenter}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <LogOut color={colors.danger} size={20} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>{t.logOut}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.logoutButton, { marginTop: 0 }]} onPress={handleDeleteAccount} disabled={deleting}>
            {deleting ? <ActivityIndicator color={colors.danger} /> : <Trash2 color={colors.danger} size={20} />}
            <Text style={[styles.logoutText, { color: colors.danger }]}>{t.deleteAccount}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {renderLangModal()}
      {renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: SIZES.fontXLarge, fontWeight: 'bold', padding: SIZES.padding },
  profileHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.padding, marginBottom: 32 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 64, height: 64, borderRadius: 32 },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  profileInfo: { marginLeft: 16, flex: 1 },
  profileName: { fontSize: SIZES.fontLarge, fontWeight: 'bold' },
  profileEmail: { fontSize: SIZES.fontSmall, marginTop: 4 },
  section: { marginBottom: 24, paddingVertical: 8 },
  sectionTitle: { fontSize: SIZES.fontSmall, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: SIZES.padding, marginBottom: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: SIZES.padding, borderBottomWidth: 1 },
  settingIconText: { flexDirection: 'row', alignItems: 'center' },
  settingText: { fontSize: SIZES.fontMedium, marginLeft: 12 },
  langPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  langPillText: { fontSize: 14, fontWeight: 'bold', marginHorizontal: 6 },
  actionsContainer: { marginTop: 8 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  logoutText: { fontSize: SIZES.fontMedium, fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', borderRadius: SIZES.radius, padding: 24 },
  modalTitle: { fontSize: SIZES.fontLarge, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalItem: { paddingVertical: 16, borderBottomWidth: 1, alignItems: 'center' },
  modalItemText: { fontSize: SIZES.fontMedium },
  inputLabel: { fontSize: SIZES.fontSmall, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: SIZES.radius, padding: 16, fontSize: SIZES.fontMedium },
  primaryButton: { paddingVertical: 16, borderRadius: SIZES.radius, alignItems: 'center', marginTop: 24 },
  primaryButtonText: { color: '#fff', fontSize: SIZES.fontMedium, fontWeight: 'bold' },
  closeButton: { marginTop: 16, padding: 16, borderRadius: SIZES.radius, alignItems: 'center' },
  closeButtonText: { fontSize: SIZES.fontMedium, fontWeight: 'bold' }
});
