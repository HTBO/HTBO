import React, { useEffect } from 'react';
import { StyleSheet, Image, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/authService';

export default function ProfileScreen() {

  
  useEffect(() => {
    getUserInfo();
  }, []);
  
  async function getUserInfo() {
    console.log('a');
    const currentToken = authService.getToken()
      if (!currentToken) {
        console.error('No auth data found');
        return;
      }
    const response = await fetch('https://htbo-production.up.railway.app/api/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    });
    // console.log(currentToken)
    // console.log(response);

    const rawData = await response.json();
    // console.log('Nyers válasz adatok:', rawData);

    // Ideiglenes fix a _j mező kinyeréséhez
    const processedData = {
      token: rawData._j,  // A token kinyerése
      user: {
        id: rawData._h,
        // Egyéb mezők a backend válaszból
      }
    };
    console.log(processedData.token);

    // if (!response.ok) {
    //   throw new Error(`API error: ${response.status}`);
    // }
    // const data = await response.json();
    // console.log(data);
    return processedData.token;
}
  
  const user = {
    username: "GamerTyler",
    joinDate: "Member since March 2023",
    avatarUrl: require('@/assets/images/react-logo.png'), // Replace with your image path
    gamesPlayed: 42,
    friendsCount: 128,
    bio: "Gaming enthusiast, streamer and competitive player. Always looking for new teammates!"
  };


  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          {/* Profile Picture */}
          <Image 
            source={user.avatarUrl} 
            style={styles.profilePicture} 
            defaultSource={require('@/assets/images/react-logo.png')} 
          />
          
          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.joinDate}>{user.joinDate}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.gamesPlayed}</Text>
                <Text style={styles.statLabel}>Games</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.friendsCount}</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
        
        {/* Settings Button */}
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color="#7C3AED" />
          <Text style={styles.settingsText}>Account Settings</Text>
        </TouchableOpacity>
        
        {/* Additional sections could be added here */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  profileCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    marginRight: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginTop: 0,
  },
  settingsText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '500',
    marginLeft: 12,
  },
});