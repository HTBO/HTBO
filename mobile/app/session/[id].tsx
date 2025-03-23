import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SessionModel, defaultSession } from "@/models/SessionModel";
import { authService } from "@/services/authService";

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [session, setSession] = useState<SessionModel>(defaultSession);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchSessionDetails(id as string);
    }
  }, [id]);

  async function fetchSessionDetails(sessionId: string) {
    try {
      setIsLoading(true);

      const token = await authService.getToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch(
        `https://htbo-production.up.railway.app/api/sessions/${sessionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Session details:", data);

      setSession(data);
    } catch (error) {
      console.error("Error fetching session details:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load session details"
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Format date for display
  function formatDate(dateString: string) {
    if (!dateString) return "Date not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // Format time for display
  function formatTime(dateString: string) {
    if (!dateString) return "Time not set";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: isLoading
            ? "Loading..."
            : session.description || "Session Details",
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading session details...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchSessionDetails(id as string)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Game Information Card */}
          <View style={styles.gameCard}>
            <Image
              source={
                session.gameImage || require("@/assets/images/games/fifa.png")
              }
              style={styles.gameImage}
              defaultSource={require("@/assets/images/games/fifa.png")}
            />
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>
                {session.gameName || "Game Session"}
              </Text>
              <Text style={styles.sessionTitle}>{session.description}</Text>
              <View style={styles.dateTimeContainer}>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.infoText}>
                    {formatDate(session.scheduledAt)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.infoText}>
                    {formatTime(session.scheduledAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Session Details Card */}
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Session Information</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Host:</Text>
              <Text style={styles.detailValue}>
                {session.hostName || "Unknown Host"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created:</Text>
              <Text style={styles.detailValue}>
                {formatDate(session.createdAt)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Session ID:</Text>
              <Text style={styles.detailValue}>{session._id}</Text>
            </View>
          </View>

          {/* Participants Card */}
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>
              Participants ({session.participants.length})
            </Text>

            {session.participants.length === 0 ? (
              <Text style={styles.emptyText}>No participants yet</Text>
            ) : (
              session.participants.map((participant, index) => (
                <View key={index} style={styles.participantRow}>
                  <View style={styles.participantInfo}>
                    <View style={styles.participantAvatar}>
                      <Text style={styles.avatarText}>
                        {(participant.username?.[0] || "?").toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.participantName}>
                      {participant.username || "Unknown User"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      participant.status === "accepted"
                        ? styles.acceptedStatus
                        : participant.status === "pending"
                        ? styles.pendingStatus
                        : styles.declinedStatus,
                    ]}
                  >
                    <Text style={styles.statusText}>{participant.status}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.joinButton}>
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
              <Text style={styles.joinButtonText}>Join Session</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
    padding: 16,
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  gameCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  gameImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 14,
    color: "#7C3AED",
    fontWeight: "600",
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  dateTimeContainer: {
    gap: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  detailCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  detailLabel: {
    flex: 1,
    fontSize: 16,
    color: "#9CA3AF",
  },
  detailValue: {
    flex: 2,
    fontSize: 16,
    color: "white",
  },
  emptyText: {
    color: "#9CA3AF",
    textAlign: "center",
    padding: 16,
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  participantName: {
    fontSize: 16,
    color: "white",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  acceptedStatus: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  pendingStatus: {
    backgroundColor: "rgba(252, 211, 77, 0.2)",
  },
  declinedStatus: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 12,
  },
  joinButton: {
    flex: 2,
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  joinButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  shareButton: {
    flex: 1,
    backgroundColor: "#4B5563",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
