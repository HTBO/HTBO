import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';

interface Notification {
  id: string;
  type: 'invite' | 'reminder' | 'update' | 'friend_request';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionData?: {
    sessionId?: string;
    userId?: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'invite',
    title: 'New Gaming Session',
    message: 'John invited you to play FIFA 24',
    timestamp: new Date(),
    read: false,
    actionData: {
      sessionId: 'session123'
    }
  },
  {
    id: '2',
    type: 'friend_request',
    title: 'New Friend Request',
    message: 'Mike wants to be your friend',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    read: true,
    actionData: {
      userId: 'user456'
    }
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Session Starting Soon',
    message: 'Your Call of Duty session starts in 30 minutes',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    read: false,
    actionData: {
      sessionId: 'session789'
    }
  }
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'invite': return 'game-controller-outline';
      case 'reminder': return 'calendar-outline';
      case 'update': return 'notifications-outline';
      case 'friend_request': return 'person-add-outline';
      default: return 'notifications-outline';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    switch (notification.type) {
      case 'invite':
        if (notification.actionData?.sessionId) {
          router.push({
            pathname: "/sessions",
            params: { id: notification.actionData.sessionId }
          });
        }
        break;
      case 'friend_request':
        router.push("/groups");
        break;
      // Add more cases as needed
    }
  };

  useEffect(() => {
    const loadMockData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotifications(mockNotifications);
      } catch (error) {
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    loadMockData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerStyle: {
            backgroundColor: "#111827",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="notifications-off-outline" size={48} color="#6B7280" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.notificationList}>
          {notifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.unreadNotification
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={getNotificationIcon(notification.type)} 
                  size={24} 
                  color="#FFFFFF" // Changed to white
                />
              </View>
              <View style={styles.contentContainer}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <Text style={styles.timestamp}>
                  {new Date(notification.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    color: '#FFFFFF', // White text
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#374151', // Dark card background
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  unreadNotification: {
    backgroundColor: '#312E81', // Darker indigo for unread
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED', // Purple accent
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED', // Purple background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#D1D5DB', // Light gray text
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF', // Gray text
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444', // Red error text
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#D1D5DB', // Light gray text
    marginTop: 8,
  }
});