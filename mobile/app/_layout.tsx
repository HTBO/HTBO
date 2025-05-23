import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { NotificationService } from '../services/notificationService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Register for push notifications
    NotificationService.registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('Push token:', token);
        // Send this token to your backend
      }
    });

    // Handle notifications when app is in foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      // Check if this is an in-app notification
      if (notification.request.content.data?.inApp) {
        // Handle in-app notification display
        console.log('Received in-app notification:', notification);
      }
    });

    return () => subscription.remove();
  }, []);

  const handleNotificationTap = (data: any) => {
    if (data.type === 'invite') {
      router.push({
        pathname: "/session/[id]",
        params: { id: data.sessionId }
      });
    } else if (data.type === 'friend_request') {
      router.push("/groups");
    }
  };

  if (!loaded) {
    return null;
  }


  return (
    <Stack initialRouteName="login">
      <Stack.Screen 
        name="index"
        initialParams={{ redirect: true }} // Set initial params to redirect
      />
      <Stack.Screen 
        name="login" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}
