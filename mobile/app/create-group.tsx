import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Friend, UserDetails } from "../models/FriendModel";
import { UserModel } from "../models/UserModel";
import { authService } from "../services/authService";

// Game categories - you can keep these as is or fetch from API
const GAME_CATEGORIES = [
  { id: "1", name: "FPS" },
  { id: "2", name: "Sports" },
  { id: "3", name: "Racing" },
];

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<UserModel[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<UserModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [groupDescription, setGroupDescription] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Fetch friends from the API
  const fetchFriends = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await authService.getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/myfriends",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load friends. Status: ${response.status}`);
      }

      const friendsData: Friend[] = await response.json();
      console.log("Friends data received:", friendsData);

      // Filter only accepted friends and convert to UserModel format
      const acceptedFriends = friendsData
        .filter((friend) => friend.friendStatus === "accepted")
        .map((friend) => {
          if (typeof friend.userId === "object" && friend.userId !== null) {
            return {
              _id: friend.userId._id,
              username: friend.userId.username || "Unknown",
              email: friend.userId.email || "",
              avatarUrl: friend.userId.avatarUrl,
              friends: [],
              games: [],
              sessions: [],
              groups: [],
              createdAt: "",
              updatedAt: "",
            } as UserModel;
          }
          return null;
        })
        .filter((friend): friend is UserModel => friend !== null);

      setFriends(acceptedFriends);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
      setError(err instanceof Error ? err.message : "Failed to load friends");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a function to fetch the current user's info
  const fetchCurrentUser = async () => {
    try {
      const token = await authService.getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get current user. Status: ${response.status}`
        );
      }

      const userData = await response.json();
      console.log("Current user data:", userData);

      // Set the current user ID from the _id field
      if (userData && userData._id) {
        setCurrentUserId(userData._id);
      } else {
        throw new Error("User ID not found in response");
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      setError(err instanceof Error ? err.message : "Failed to get user info");
    }
  };

  // Toggle friend selection
  const toggleFriendSelection = (friend: UserModel) => {
    if (selectedFriends.some((f) => f._id === friend._id)) {
      setSelectedFriends((prev) => prev.filter((f) => f._id !== friend._id));
    } else {
      setSelectedFriends((prev) => [...prev, friend]);
    }
  };

  // Remove friend from selection
  const removeFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.filter((friend) => friend._id !== friendId)
    );
  };

  // Select category
  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryModal(false);
  };

  // Get category name by ID
  const getCategoryName = () => {
    if (!selectedCategory) return null;
    const category = GAME_CATEGORIES.find((cat) => cat.id === selectedCategory);
    return category ? category.name : null;
  };

  // Filter friends by search query
  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create group handler
  const handleCreateGroup = async () => {
    if (!groupName || !selectedCategory || selectedFriends.length === 0) return;
    if (!currentUserId) {
      setError("User ID not available. Please try again.");
      return;
    }

    setIsCreatingGroup(true);
    setError(null);

    try {
      const token = await authService.getToken();
      if (!token) throw new Error("Authentication required");

      // Use the fetched current user ID instead of hardcoded value
      const requestBody = {
        ownerId: currentUserId,
        name: groupName,
        description: groupDescription,
        members: selectedFriends.map((friend) => ({
          memberId: friend._id,
        })),
      };

      console.log("Creating group with data:", requestBody);

      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/groups/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create group: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Group created successfully:", result);

      // Reset form fields
      setGroupName("");
      setGroupDescription("");
      setSelectedCategory(null);
      setSelectedFriends([]);

      // Navigate back or show success message
      alert("Group created successfully!");
    } catch (err) {
      console.error("Error creating group:", err);
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Fetch friends when component mounts
  useEffect(() => {
    fetchFriends();
    fetchCurrentUser();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Create Group",
          headerStyle: {
            backgroundColor: "#111827",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
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
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>

        {/* Group Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter group description..."
            placeholderTextColor="#6B7280"
            value={groupDescription}
            onChangeText={setGroupDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Game Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Game Category</Text>
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text
              style={
                selectedCategory
                  ? styles.dropdownText
                  : styles.dropdownPlaceholder
              }
            >
              {getCategoryName() || "Select game category..."}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Friends Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Add Friends</Text>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Selected Friends */}
          {selectedFriends.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectedFriendsContainer}
            >
              {selectedFriends.map((friend) => (
                <View key={friend._id} style={styles.friendChip}>
                  <Image
                    source={
                      friend.avatarUrl
                        ? { uri: friend.avatarUrl }
                        : require("../assets/images/react-logo.png")
                    }
                    style={styles.chipAvatar}
                  />
                  <Text style={styles.chipName}>{friend.username}</Text>
                  <TouchableOpacity
                    style={styles.chipRemove}
                    onPress={() => removeFriend(friend._id)}
                  >
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Friends List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.loadingText}>Loading friends...</Text>
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : filteredFriends.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No friends match your search"
                : "No friends found"}
            </Text>
          ) : (
            <FlatList
              data={filteredFriends}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.friendItem}
                  onPress={() => toggleFriendSelection(item)}
                >
                  <Image
                    source={
                      item.avatarUrl
                        ? { uri: item.avatarUrl }
                        : require("../assets/images/react-logo.png")
                    }
                    style={styles.friendAvatar}
                  />
                  <Text style={styles.friendName}>{item.username}</Text>
                  <View style={styles.checkboxContainer}>
                    {selectedFriends.some((f) => f._id === item._id) ? (
                      <Ionicons name="checkbox" size={24} color="#7C3AED" />
                    ) : (
                      <Ionicons
                        name="square-outline"
                        size={24}
                        color="#9CA3AF"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (isCreatingGroup ||
              !groupName ||
              !selectedCategory ||
              selectedFriends.length === 0) &&
              styles.disabledButton,
          ]}
          onPress={handleCreateGroup}
          disabled={
            isCreatingGroup ||
            !groupName ||
            !selectedCategory ||
            selectedFriends.length === 0
          }
        >
          {isCreatingGroup ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.createButtonText}>Create Group</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={GAME_CATEGORIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => selectCategory(item.id)}
                >
                  <Text style={styles.categoryName}>{item.name}</Text>
                  {selectedCategory === item.id && (
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
    backgroundColor: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#E5E7EB",
    marginTop: 10,
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    padding: 16,
  },
  emptyText: {
    color: "#9CA3AF",
    textAlign: "center",
    padding: 16,
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  imagePickerText: {
    fontSize: 16,
    color: "#7C3AED",
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#E5E7EB",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1F2937",
    color: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dropdownSelector: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#6B7280",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
  },
  selectedFriendsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  friendChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
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
    color: "white",
    marginRight: 6,
  },
  chipRemove: {
    padding: 2,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
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
    color: "white",
  },
  checkboxContainer: {
    padding: 4,
  },
  createButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#4B5563",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1F2937",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  categoryName: {
    fontSize: 16,
    color: "white",
  },
});
