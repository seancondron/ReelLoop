import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';


export default function SettingsScreen() {
  const { logout, forceLogout } = useAuth();
  const { theme, toggleDarkMode, setDarknessLevel, isDarkMode } = useTheme();
  const [skipRestrictedPosts, setSkipRestrictedPosts] = useState(false);

  useEffect(() => {
    loadSetting();
  }, []);

  const loadSetting = async () => {
    try {
      const skipValue = await AsyncStorage.getItem('skipRestrictedPosts');
      setSkipRestrictedPosts(skipValue === 'true');
    } catch (error) {
      console.error('Error loading setting:', error);
    }
  };

  const handleToggleSkipRestricted = async (value: boolean) => {
    try {
      setSkipRestrictedPosts(value);
      await AsyncStorage.setItem('skipRestrictedPosts', value.toString());
    } catch (error) {
      console.error('Error saving setting:', error);
      Alert.alert('Error', 'Failed to save setting. Please try again.');
    }
  };

  const handleDarknessLevelChange = (level: 'light' | 'medium' | 'dark' | 'black') => {
    setDarknessLevel(level);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              setTimeout(() => {
                router.replace('/login');
              }, 100);
              
            } catch (error) {
              console.error('Error during logout:', error);
              try {
                await forceLogout();
                setTimeout(() => {
                  router.replace('/login');
                }, 100);
                
              } catch (forceError) {
                console.error('Force logout also failed:', forceError);
                try {
                  await AsyncStorage.removeItem('userToken');
                  router.replace('/login');
                } catch (directError) {
                  console.error('Direct logout failed:', directError);
                  Alert.alert(
                    'Logout Error',
                    'There was an error logging out. Please restart the app.',
                    [{ text: 'OK' }]
                  );
                }
              }
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <View style={[styles.settingContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Skip Restricted Posts</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
              When enabled, private or restricted Instagram posts will be skipped instead of saved with limited information.
            </Text>
          </View>
          <Switch
            value={skipRestrictedPosts}
            onValueChange={handleToggleSkipRestricted}
            trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
            thumbColor={skipRestrictedPosts ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      <View style={[styles.settingContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
              Enable dark mode for better viewing in low light conditions.
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
            thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
        
        {isDarkMode && (
          <View style={[styles.darknessLevelContainer, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.darknessLevelTitle, { color: theme.colors.text }]}>Darkness Level</Text>
            <View style={styles.darknessLevelOptions}>
              {[
                { value: 'light', label: 'Gray' },
                { value: 'medium', label: 'Dark Gray' },
                { value: 'dark', label: 'Black' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.darknessLevelOption,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                    theme.darknessLevel === option.value && styles.darknessLevelOptionSelected
                  ]}
                  onPress={() => handleDarknessLevelChange(option.value as any)}
                >
                  <View style={styles.darknessLevelOptionContent}>
                    <Text style={[
                      styles.darknessLevelOptionLabel,
                      { color: theme.colors.text },
                      theme.darknessLevel === option.value && styles.darknessLevelOptionLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                  </View>
                  {theme.darknessLevel === option.value && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.error }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
        <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  darknessLevelContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  darknessLevelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  darknessLevelOptions: {
    gap: 8,
  },
  darknessLevelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  darknessLevelOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  darknessLevelOptionContent: {
    flex: 1,
  },
  darknessLevelOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  darknessLevelOptionLabelSelected: {
    color: '#007AFF',
  },
});
