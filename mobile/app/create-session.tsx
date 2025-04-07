import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Game } from "../models/GameModel";
import DateTimePicker from "@react-native-community/datetimepicker";
import { authService } from "../services/authService";
import { Friend } from "../models/FriendModel";
import { Group } from "../models/GroupModel";
import { UserModel } from "../models/UserModel";

// Add a Participant interface right after the imports
interface Participant {
  user?: string;
  group?: string;
}

export default function CreateSessionScreen() {
  // Basic info
  const [title, setTitle] = useState("");
  const [gameId, setGameId] = useState("");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [showGamePicker, setShowGamePicker] = useState(false);

  // Date & Time
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const [description, setDescription] = useState("");

  // Friends & Groups data
  const [friends, setFriends] = useState<Friend[]>([]);
  const [detailedFriends, setDetailedFriends] = useState<UserModel[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Modals for selection
  const [showFriendsPicker, setShowFriendsPicker] = useState(false);
  const [showGroupsPicker, setShowGroupsPicker] = useState(false);

  // User and session state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGames();
    fetchCurrentUser();
    fetchFriends();
    fetchGroups();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoadingUser(true);

      // Get authentication token
      const token = await authService.getToken();
      if (!token) {
        console.error("No token found");
        Alert.alert("Authentication Error", "Please log in again");
        router.replace("/login");
        return;
      }

      // Make authenticated request
      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/me",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const userData = await response.json();
      setCurrentUser(userData);

      // Auto-select current user
      if (userData._id) {
        setSelectedFriends([userData._id]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load your user profile");
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchFriends = async () => {
    setIsLoadingFriends(true);
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
      setFriends(friendsData);

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

      setDetailedFriends(acceptedFriends);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
      setError(err instanceof Error ? err.message : "Failed to load friends");
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    setError(null);

    try {
      const token = await authService.getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/mygroups",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load groups. Status: ${response.status}`);
      }

      const groupsData: Group[] = await response.json();
      setGroups(groupsData);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setError(err instanceof Error ? err.message : "Failed to load groups");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchGames = async () => {
    try {
      setLoadingGames(true);
      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/games"
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      // Map response data to ensure it follows our Game model structure
      const formattedGames: Game[] = data.map((game: any) => ({
        id: game._id || game.id || "",
        name: game.title || game.name || "",
        description: game.description || "",
        shortDescription: game.shortDescription || "",
        publisher: game.publisher || "",
        releaseYear: game.releaseYear || new Date().getFullYear(),
        stores: game.stores || [],
        createdAt: game.createdAt || "",
        updatedAt: game.updatedAt || "",
      }));

      setGames(formattedGames);
    } catch (error) {
      console.error("Error fetching games:", error);
      Alert.alert("Error", "Failed to load games list");
    } finally {
      setLoadingGames(false);
    }
  };

  // Toggle friend selection
  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  // Toggle group selection
  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  // Date picker handlers
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (selectedDate: Date) => {
    setSelectedDate(selectedDate);
    const formattedDate = selectedDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    setDate(formattedDate);
    hideDatePicker();
  };

  // Time picker handlers
  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  const handleTimeConfirm = (selectedTime: Date) => {
    if (selectedDate) {
      const updatedDate = new Date(selectedDate);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setSelectedDate(updatedDate);
    } else {
      const updatedDate = new Date();
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes()); // Fixed typo: updatedTime -> selectedTime
      setSelectedDate(updatedDate);
    }

    const formattedTime = selectedTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setTime(formattedTime);
    hideTimePicker();
  };

  const handleSubmit = async () => {
    // Check if user is loaded
    if (!currentUser || !currentUser._id) {
      Alert.alert("Error", "Your user profile could not be loaded");
      return;
    }

    // Form validation
    if (!selectedGame || !selectedDate) {
      Alert.alert("Missing Fields", "Please select a game and date/time");
      return;
    }

    try {
      setIsLoading(true);

      const token = await authService.getToken();
      if (!token) {
        Alert.alert("Authentication Error", "Please log in again");
        router.replace("/login");
        return;
      }

      // Format date directly from the Date object to ISO format
      const scheduledAt = selectedDate ? selectedDate.toISOString() : null;

      // Define participants with proper type
      const participants: Participant[] = [];

      // Add selected friends as participants
      selectedFriends.forEach((friendId) => {
        participants.push({ user: friendId });
      });

      // Add selected groups as participants
      selectedGroups.forEach((groupId) => {
        participants.push({ group: groupId });
      });

      // Create session object with the exact format required by the API
      const sessionData = {
        hostId: currentUser._id,
        gameId: selectedGame.id,
        scheduledAt: scheduledAt,
        description: description,
        participants: participants,
      };

      console.log("Sending session data:", JSON.stringify(sessionData));

      // Send to API
      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sessionData),
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Session created:", data);

      // Navigate back to sessions page
      router.push("/(tabs)/sessions");
    } catch (error) {
      console.error("Error creating session:", error);

      if (error instanceof Error && error.message.includes("status")) {
        Alert.alert(
          "Server Error",
          `Failed to create session: ${error.message}`
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to create session. Please check your inputs and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Create Session",
          headerStyle: {
            backgroundColor: "#111827",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerBackTitle: "Back",
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Game Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Game</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowGamePicker(true)}
            >
              <Text
                style={selectedGame ? styles.inputText : styles.placeholderText}
              >
                {selectedGame ? selectedGame.name : "Select a game..."}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Game Picker Modal */}
          <Modal
            visible={showGamePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select a Game</Text>

                {loadingGames ? (
                  <ActivityIndicator size="large" color="#7C3AED" />
                ) : (
                  <FlatList
                    data={games}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.gameItem}
                        onPress={() => {
                          setSelectedGame(item);
                          setGameId(item.id);
                          setShowGamePicker(false);
                        }}
                      >
                        <Text style={styles.gameTitle}>{item.name}</Text>
                        <Text style={styles.gamePublisher}>
                          {item.publisher} • {item.releaseYear}
                        </Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <Text style={styles.emptyListText}>
                        No games available
                      </Text>
                    }
                  />
                )}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowGamePicker(false)}
                >
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Date & Time */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.input} onPress={showDatePicker}>
                <Text style={date ? styles.inputText : styles.placeholderText}>
                  {date ? date : "MM/DD/YYYY"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity style={styles.input} onPress={showTimePicker}>
                <Text style={time ? styles.inputText : styles.placeholderText}>
                  {time ? time : "HH:MM AM/PM"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DateTimePicker Modals */}
          {isDatePickerVisible && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setDatePickerVisible(false);
                if (date) handleDateConfirm(date);
              }}
            />
          )}

          {isTimePickerVisible && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="time"
              display="default"
              onChange={(event, time) => {
                setTimePickerVisible(false);
                if (time) handleTimeConfirm(time);
              }}
            />
          )}

          {/* Friends Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Friends</Text>
            {isLoadingFriends ? (
              <ActivityIndicator
                size="small"
                color="#7C3AED"
                style={styles.loader}
              />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load friends</Text>
                <TouchableOpacity
                  onPress={fetchFriends}
                  style={styles.retryButton}
                >
                  <Ionicons name="refresh" size={16} color="white" />
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.selectionContainer}>
                {detailedFriends.length === 0 ? (
                  <Text style={styles.noDataText}>No friends available</Text>
                ) : (
                  detailedFriends.map((friend) => (
                    <TouchableOpacity
                      key={friend._id}
                      style={[
                        styles.selectionItem,
                        selectedFriends.includes(friend._id) &&
                          styles.selectedItem,
                        currentUser &&
                          friend._id === currentUser._id &&
                          styles.currentUserItem,
                      ]}
                      onPress={() =>
                        friend._id !== currentUser._id &&
                        toggleFriend(friend._id)
                      }
                    >
                      <Text
                        style={[
                          styles.selectionText,
                          selectedFriends.includes(friend._id) &&
                            styles.selectedText,
                          currentUser &&
                            friend._id === currentUser._id &&
                            styles.currentUserText,
                        ]}
                      >
                        {friend.username}{" "}
                        {currentUser && friend._id === currentUser._id
                          ? "(You)"
                          : ""}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Groups Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Groups</Text>
            {isLoadingGroups ? (
              <ActivityIndicator
                size="small"
                color="#7C3AED"
                style={styles.loader}
              />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load groups</Text>
                <TouchableOpacity
                  onPress={fetchGroups}
                  style={styles.retryButton}
                >
                  <Ionicons name="refresh" size={16} color="white" />
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.selectionContainer}>
                {groups.length === 0 ? (
                  <Text style={styles.noDataText}>No groups available</Text>
                ) : (
                  groups.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      style={[
                        styles.selectionItem,
                        selectedGroups.includes(group.id) &&
                          styles.selectedItem,
                      ]}
                      onPress={() => toggleGroup(group.id)}
                    >
                      <Text
                        style={[
                          styles.selectionText,
                          selectedGroups.includes(group.id) &&
                            styles.selectedText,
                        ]}
                      >
                        {group.name} ({group.members.length})
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
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
            style={[
              styles.createButton,
              (isLoading || loadingUser) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isLoading || loadingUser}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? "Creating..." : "Create Session"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  halfWidth: {
    width: "47%",
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  createButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#6B7280",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
    textAlign: "center",
  },
  gameItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  gameTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  gamePublisher: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 2,
  },
  emptyListText: {
    color: "#E5E7EB",
    textAlign: "center",
    padding: 20,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#4B5563",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  inputText: {
    color: "#FFFFFF",
  },
  placeholderText: {
    color: "#6B7280",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  loadingText: {
    color: "#E5E7EB",
    marginLeft: 8,
    fontSize: 14,
  },
  // New styles for friend/group selection
  selectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  selectionItem: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
  },
  selectedItem: {
    backgroundColor: "#4F46E5",
  },
  currentUserItem: {
    backgroundColor: "#22C55E", // Green for current user
    opacity: 0.8,
  },
  selectionText: {
    color: "#D1D5DB",
    fontSize: 14,
  },
  selectedText: {
    color: "white",
  },
  currentUserText: {
    color: "white",
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 10,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#371827",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    color: "#F87171",
    fontSize: 14,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4B5563",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  retryText: {
    color: "white",
    fontSize: 12,
    marginLeft: 4,
  },
  noDataText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginVertical: 10,
  },
});
