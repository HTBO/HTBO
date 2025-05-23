import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Animated } from 'react-native';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  static async showInAppNotification(
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) {
    // We'll use the Notifications API for in-app notifications
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: message,
        data: { inApp: true },
      },
      trigger: null,
    });
  }

  static async registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
      });
    }

    return token;
  }

  static async schedulePushNotification({
    title,
    body,
    data = {},
    trigger = null,
    showInApp = false
  }: {
    title: string;
    body: string;
    data?: any;
    trigger?: null;
    showInApp?: boolean;
  }) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { ...data, inApp: showInApp },
        },
        trigger: null,
      });

      if (showInApp) {
        await this.showInAppNotification(title, body);
      }

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }
}