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
  // Removed duplicate declaration of showDatePicker
  // Removed duplicate declaration of showTimePicker

  const [description, setDescription] = useState("");

  // User and group IDs for participants
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userId1, setUserId1] = useState("");
  const [userId2, setUserId2] = useState("");
  const [groupId1, setGroupId1] = useState("");
  const [groupId2, setGroupId2] = useState("");

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGames();
    fetchCurrentUser();
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

      // Set userId1 to current user's ID automatically
      setUserId1(userData._id);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load your user profile");
    } finally {
      setLoadingUser(false);
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

  // Date picker handlers
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (selectedDate: Date) => {
    // Store the full date object for later use
    setSelectedDate(selectedDate);

    // Just for display purposes in the UI
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
    // Update the selected date with the new time values
    if (selectedDate) {
      const updatedDate = new Date(selectedDate);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setSelectedDate(updatedDate);
    } else {
      // If no date was previously selected, use today with the selected time
      const updatedDate = new Date();
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setSelectedDate(updatedDate);
    }

    // Just for display purposes in the UI
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
    // if (!selectedGame || !selectedDate || !userId1) {
    //   Alert.alert("Missing Fields", "Please fill out all required fields");
    //   return;
    // }

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

      // Define participant type
      type Participant = { user?: string; group?: string };

      // Create participants array
      const participants: Participant[] = [{ user: userId1 }];

      // Add optional participants
      if (userId2) participants.push({ user: userId2 });
      if (groupId1) participants.push({ group: groupId1 });
      if (groupId2) participants.push({ group: groupId2 });

      // Create session object
      const sessionData = {
        hostId: currentUser._id,
        gameId: selectedGame.id, // Use the ID from the selected game object
        scheduledAt: scheduledAt,
        description: description,
        participants: participants,
      };

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
      console.log(JSON.stringify(sessionData));
      // console.log(response);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Session created:", data);

      // Navigate back to sessions page
      router.push("/(tabs)/sessions");
    } catch (error) {
      console.error("Error creating session:", error);

      // More specific error message
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
          {/* We removed the Host ID input since it's auto-fetched */}

          {/* Game Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Game (required)</Text>
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

          {/* Date & Time - Now with pickers */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date (required)</Text>
              <TouchableOpacity style={styles.input} onPress={showDatePicker}>
                <Text style={date ? styles.inputText : styles.placeholderText}>
                  {date ? date : "MM/DD/YYYY"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time (required)</Text>
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

          {/* Participants */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>User ID 1 (required)</Text>
            <TextInput
              style={styles.input}
              value={userId1}
              onChangeText={setUserId1}
              placeholder="Enter user ID..."
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>User ID 2 (optional)</Text>
            <TextInput
              style={styles.input}
              value={userId2}
              onChangeText={setUserId2}
              placeholder="Enter optional user ID..."
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Group ID 1 (optional)</Text>
            <TextInput
              style={styles.input}
              value={groupId1}
              onChangeText={setGroupId1}
              placeholder="Enter group ID..."
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Group ID 2 (optional)</Text>
            <TextInput
              style={styles.input}
              value={groupId2}
              onChangeText={setGroupId2}
              placeholder="Enter optional group ID..."
              placeholderTextColor="#6B7280"
            />
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

          {/* Loading indicator when fetching user data */}
          {loadingUser && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#7C3AED" />
              <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
          )}

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
});
