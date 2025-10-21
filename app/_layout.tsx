import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { SavedItemsProvider } from '../contexts/SavedItemsContext';
import { ThemeProvider } from '../contexts/ThemeContext';

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();

  // Show loading screen while checking auth status
  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack 
      key={isAuthenticated ? 'authenticated' : 'unauthenticated'} 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SavedItemsProvider>
          <RootLayoutNav />
        </SavedItemsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
