import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

export default function CreateSessionScreen() {
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('4');
  const [description, setDescription] = useState('');
  
  const handleSubmit = () => {
    // Form validation
    if (!title || !game || !date || !time) {
      // Show error (would add proper validation UI in production)
      console.error('Please fill out all required fields');
      return;
    }
    
    // Create session object
    const newSession = {
      title,
      game,
      date,
      time,
      maxParticipants: parseInt(maxParticipants, 10),
      description,
    };
    
    // Here you would send this to your API
    console.log('Creating new session:', newSession);
    
    // Navigate back to sessions page
    router.push('/(tabs)/sessions');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Create Session',
          headerStyle: {
            backgroundColor: '#111827',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: "Back"
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Session Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Session Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter session title..."
              placeholderTextColor="#6B7280"
            />
          </View>
          
          {/* Game Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Game</Text>
            <TextInput
              style={styles.input}
              value={game}
              onChangeText={setGame}
              placeholder="Enter game name..."
              placeholderTextColor="#6B7280"
            />
          </View>
          
          {/* Date & Time */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#6B7280"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM AM/PM"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>
          
          {/* Max Participants */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Participants</Text>
            <TextInput
              style={styles.input}
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="numeric"
              placeholder="Enter max number of participants..."
              placeholderTextColor="#6B7280"
            />
          </View>
          
          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your gaming session..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={4}
            />
          </View>
          
          {/* Create Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleSubmit}
          >
            <Text style={styles.createButtonText}>Create Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  halfWidth: {
    width: '47%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E5E7EB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});