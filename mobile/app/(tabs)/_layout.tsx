import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParamListBase } from '@react-navigation/native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

// Create a new TabBarBackground component inline to ensure styling works
const FloatingTabBarBackground: React.FC<any> = (props) => {
  return <View style={styles.tabBarBackground} {...props} />;
};

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  // Define a custom tab button for regular tabs with proper typing
  const CustomTab: React.FC<BottomTabBarButtonProps> = (props) => {
    return <HapticTab {...props} style={styles.tabButton} />;
  };

  // Define center button with proper typing
  const CenterButton: React.FC<{onPress?: (event: GestureResponderEvent) => void}> = ({ onPress }) => {
    return (
      <TouchableOpacity
        style={styles.centerButtonContainer}
        onPress={onPress}
      >
        <View style={styles.centerButton}>
          <Ionicons name="add" size={24} color="white" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#7C3AED',
        headerShown: false,
        tabBarBackground: () => <FloatingTabBarBackground />,
        tabBarIconStyle: {
          marginTop: 40,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 8,
        },
        tabBarButton: (props: BottomTabBarButtonProps) => 
          route.name === 'create' ? (
            <CenterButton onPress={props.onPress} />
          ) : (
            <CustomTab {...props} />
          ),
        tabBarStyle: styles.tabBar,
      })}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />

<Tabs.Screen
    name="sessions"
    options={{
      title: 'Sessions',
      tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />,
    }}
  />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => null,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            console.log('Create button pressed!');
          },
        }}
      />
      <Tabs.Screen
    name="groups"
    options={{
      title: 'Groups',
      tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
    }}
  />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person-circle-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65, // Slightly smaller height
    position: 'absolute',
    bottom: 45, // Increased from 20 to 30 to float higher
    left: 90, // Increased from 70 to 90 for narrower width
    right: 90, // Increased from 70 to 90 for narrower width
    borderRadius: 20, // More rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, // Stronger shadow
    shadowOpacity: 0.25, // More visible shadow
    shadowRadius: 12,
    elevation: 10, // Increased elevation for Android
    paddingHorizontal: 5, // Reduced from 10 to accommodate narrower width
    backgroundColor: '#1F2937',
    borderTopWidth: 0,
    alignItems: 'center',
    zIndex: 100, // Ensure it's on top of other elements
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20, // Match the tabBar borderRadius
    backgroundColor: '#1F2937',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -26, // Adjusted to be higher with the larger button
    left: '50%',
    transform: [{ translateX: -28 }], // Half of new button width (56/2)
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 56, // Increased from 44 to 56
    height: 56, // Increased from 44 to 56
    borderRadius: 28, // Half of width/height
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6, // Slightly stronger glow for larger button
    shadowRadius: 12, // Increased shadow radius
    elevation: 10, // Increased elevation for more prominence
  },
});