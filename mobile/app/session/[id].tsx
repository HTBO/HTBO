import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SessionDetailScreen() {
    const { id } = useLocalSearchParams();
    const [sessionTitle, setSessionTitle] = useState("Session Details");
    
    // Simulate fetching session details - replace with your actual data fetching
    useEffect(() => {
      // This would normally be an API call or database lookup
      const fetchSessionDetails = () => {
        // Simulate data lookup based on ID
        const sessionTitles: { [key: string]: string } = {
          'session-001': 'Morning Workout',
          'session-002': 'Team Training',
          'session-003': 'Recovery Session',
        };
        
        // Get the title or use a default
        const title = sessionTitles[id as string] || 'Session Details';
        setSessionTitle(title);
      };
      
      fetchSessionDetails();
    }, [id]);
  
    return (
        <SafeAreaView style={styles.container}>
          <Stack.Screen 
  options={{
    title: sessionTitle,
    headerStyle: {
      backgroundColor: '#111827',
    },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerBackTitle: "Back",
  }} 
/>
          
          {/* Add a content wrapper with consistent padding */}
          <View style={styles.contentWrapper}>
            <Text style={styles.title}>Session Details</Text>
            <Text style={styles.sessionId}>Session ID: {id}</Text>
            
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>Session Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>Training</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>March 19, 2025</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>60 minutes</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>Main Gym</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      );
}

const styles = StyleSheet.create({
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 20, // Consistent horizontal padding for all content
        paddingTop: 12,
      },
    
    container: {
      flex: 1,
      backgroundColor: '#111827',
    },
    content: {
      flex: 1,
      padding: 16,
    },
  backButton: {
    marginTop: 8,
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  sessionId: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  detailCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  detailLabel: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
  },
  detailValue: {
    flex: 2,
    fontSize: 16,
    color: 'white',
  },
});