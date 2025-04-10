import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "@/services/authService";
import { router } from "expo-router";
import { UserModel, defaultUser } from "@/models/UserModel";

export default function ProfileScreen() {
  const [user, setUser] = useState(defaultUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    getUserInfo();
  }, []);

  async function getUserInfo() {
    try {
      setIsLoading(true);

      const tokenObj = await authService.getToken();
      if (!tokenObj) {
        console.error("No auth data found");
        return;
      }

      const token = tokenObj;
      if (!token) {
        console.error("No token found in auth data");
        return;
      }

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
        console.error(`API error: ${response.status}`);
        return;
      }

      const userData = await response.json();
      console.log(userData.avatarUrl);
      setUser(userData as UserModel);
    } catch (error) {
      console.error("Error in getUserInfo:", error);
      // setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }

  // Format date to be more readable
  function formatDate(dateString: string | number | Date) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername.trim() === user.username) {
      setIsEditingUsername(false);
      return;
    }

    setIsUpdating(true);
    try {
      const token = await authService.getToken();
      if (!token) throw new Error("Authentication required");

      // Use user ID in the URL path instead of /me
      const response = await fetch(
        `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/${user._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: newUsername.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update username");
      }

      // Update local state
      setUser((prev) => ({ ...prev, username: newUsername.trim() }));
      Alert.alert("Success", "Username updated successfully");
    } catch (error) {
      console.error("Error updating username:", error);
      Alert.alert("Error", "Failed to update username. Please try again.");
    } finally {
      setIsUpdating(false);
      setIsEditingUsername(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getUserInfo}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          {/* Profile Picture */}
          <Image
            source={{ uri: user.avatarUrl || "https://via.placeholder.com/90" }}
            style={styles.profilePicture}
            defaultSource={require("@/assets/images/react-logo.png")}
          />

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>{user.username}</Text>
              <TouchableOpacity
                onPress={() => {
                  setNewUsername(user.username);
                  setIsEditingUsername(true);
                }}
                style={styles.editButton}
              >
                <Ionicons name="pencil" size={18} color="#7C3AED" />
              </TouchableOpacity>
            </View>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.joinDate}>
              Joined {formatDate(user.createdAt)}
            </Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.games.length}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.friends.length}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.sessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.groups.length}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/groups")}
          >
            <Ionicons name="people-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Find Friends</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={20} color="#7C3AED" />
            <Text style={styles.settingsText}>Account Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="shield-outline" size={20} color="#7C3AED" />
            <Text style={styles.settingsText}>Security</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="notifications-outline" size={20} color="#7C3AED" />
            <Text style={styles.settingsText}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="help-circle-outline" size={20} color="#7C3AED" />
            <Text style={styles.settingsText}>Help</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="bug-outline" size={20} color="#7C3AED" />
            <Text style={styles.settingsText}>Report Bug</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#7C3AED"
            />
            <Text style={styles.settingsText}>About</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.settingsButton, styles.logoutButtonContainer]}
            onPress={() => {
              authService.logout();
              router.replace("/login");
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Add padding at bottom to ensure content is visible above tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={isEditingUsername}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditingUsername(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Username</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter new username"
              value={newUsername}
              onChangeText={setNewUsername}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsEditingUsername(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleUpdateUsername}
                disabled={isUpdating}
              >
                <Text style={styles.modalButtonText}>
                  {isUpdating ? "Updating..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#7C3AED",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  profileCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePicture: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#7C3AED",
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  editButton: {
    marginLeft: 8,
    padding: 2,
  },
  email: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  statsCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginTop: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7C3AED",
  },
  statLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#374151",
  },
  section: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 0,
    marginBottom: 24, // Extra bottom margin
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#283548", // Changed from "#1F2937" for better contrast
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingsText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
    marginLeft: 12,
  },
  logoutButtonContainer: {
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "500",
    marginLeft: 12,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center", // Changed from "space-around" to "center"
    marginHorizontal: 16,
    marginVertical: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the content
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    padding: 16,
    width: "100%", // Make button take full width
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  bottomSpacer: {
    height: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  modalInput: {
    width: "100%",
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 10,
    color: "white",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#7C3AED",
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
