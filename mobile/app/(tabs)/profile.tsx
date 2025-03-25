import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
    <SafeAreaView style={styles.container}>
      <ScrollView>
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
            <Text style={styles.username}>{user.username}</Text>
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

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Sessions</Text>
          {user.sessions.length > 0 ? (
            user.sessions.map((session, index) => (
              <View key={index} style={styles.sessionItem}>
                <View style={styles.sessionInfoContainer}>
                  <Text style={styles.sessionId}>
                    Session #{session.sessionId.substring(0, 8)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      session.status === "pending"
                        ? styles.pendingStatus
                        : styles.completedStatus,
                    ]}
                  >
                    <Text style={styles.statusText}>{session.status}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No active game sessions</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/create-session")}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Create Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/friends")}
          >
            <Ionicons name="people-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Find Friends</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Button */}
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color="#7C3AED" />
          <Text style={styles.settingsText}>Account Settings</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            authService.logout();
            router.replace("/login");
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  emptyText: {
    color: "#9CA3AF",
    textAlign: "center",
    marginVertical: 10,
  },
  sessionItem: {
    backgroundColor: "#283548",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  sessionInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionId: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 15,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  pendingStatus: {
    backgroundColor: "#F59E0B",
  },
  completedStatus: {
    backgroundColor: "#10B981",
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    padding: 16,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 8,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginTop: 0,
  },
  settingsText: {
    fontSize: 16,
    color: "#7C3AED",
    fontWeight: "500",
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginTop: 0,
  },
  logoutText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "500",
    marginLeft: 12,
  },
});
