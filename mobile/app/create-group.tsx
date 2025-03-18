import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  FlatList,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

// Mock data - just for display
const FRIENDS = [
  { id: '1', name: 'Alex Chen', avatar: require('@/assets/images/react-logo.png') },
  { id: '2', name: 'Jordan Smith', avatar: require('@/assets/images/react-logo.png') },
  { id: '3', name: 'Taylor Kim', avatar: require('@/assets/images/react-logo.png') },
];

const GAME_CATEGORIES = [
  { id: '1', name: 'FPS' },
  { id: '2', name: 'Sports' },
  { id: '3', name: 'Racing' },
];

export default function CreateGroupScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Create Group',
          headerStyle: {
            backgroundColor: '#111827',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Group Image Picker */}
        <TouchableOpacity style={styles.imagePickerContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera" size={32} color="#9CA3AF" />
          </View>
          <Text style={styles.imagePickerText}>Add Group Photo</Text>
        </TouchableOpacity>
        
        {/* Group Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Group Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter group name..."
            placeholderTextColor="#6B7280"
          />
        </View>
        
        {/* Game Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Game Category</Text>
          <TouchableOpacity style={styles.dropdownSelector}>
            <Text style={styles.dropdownPlaceholder}>Select game category...</Text>
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        
        {/* Friends Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Add Friends</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          {/* Example of Selected Friends */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.selectedFriendsContainer}
          >
            <View style={styles.friendChip}>
              <Image source={require('@/assets/images/react-logo.png')} style={styles.chipAvatar} />
              <Text style={styles.chipName}>Alex Chen</Text>
              <TouchableOpacity style={styles.chipRemove}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.friendChip}>
              <Image source={require('@/assets/images/react-logo.png')} style={styles.chipAvatar} />
              <Text style={styles.chipName}>Jordan Smith</Text>
              <TouchableOpacity style={styles.chipRemove}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          {/* Friends List */}
          <FlatList
            data={FRIENDS}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.friendItem}>
                <Image source={item.avatar} style={styles.friendAvatar} />
                <Text style={styles.friendName}>{item.name}</Text>
                <View style={styles.checkboxContainer}>
                  {item.id === '1' ? (
                    <Ionicons name="checkbox" size={24} color="#7C3AED" />
                  ) : (
                    <Ionicons name="square-outline" size={24} color="#9CA3AF" />
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        
        {/* Create Button */}
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Category Selection Modal - Example Structure */}
      {/* In a real app, you'd control this with state */}
      <Modal
        visible={false}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={GAME_CATEGORIES}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  {item.id === '1' && (
                    <Ionicons name="checkmark" size={20} color="#7C3AED" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#7C3AED',
  },
  inputGroup: {
    marginBottom: 24,
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
  dropdownSelector: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  selectedFriendsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  friendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  chipName: {
    fontSize: 14,
    color: 'white',
    marginRight: 6,
  },
  chipRemove: {
    padding: 2,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendName: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  checkboxContainer: {
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  categoryName: {
    fontSize: 16,
    color: 'white',
  },
});