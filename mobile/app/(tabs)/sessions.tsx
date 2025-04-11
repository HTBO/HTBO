import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "@/services/authService";
import {
  SessionModel,
  SessionList,
  formatSession,
} from "@/models/SessionModel";

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<SessionList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingSessions, setProcessingSessions] = useState<{[key: string]: boolean}>({});
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const handleCardPress = (session: SessionModel) => {
    router.push({
      pathname: "/session/[id]",
      params: { id: session._id },
    });
  };

  useEffect(() => {
    getUserSessionInfo();
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      const userData = await authService.getUserData();
      if (userData) {
        setCurrentUserId(userData._id || userData.id);
      }
    };
    getCurrentUser();
  }, []);

  async function getUserSessionInfo() {
    try {
      setIsLoading(true);

      const tokenObj = await authService.getToken();
      if (!tokenObj) {
        console.error("No auth data found");
        setError("Authentication required");
        return;
      }
      
      const token = tokenObj;
      console.log(tokenObj);
      if (!token) {
        console.error("No token found in auth data");
        setError("Authentication error");
        return;
      }

      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/mysessions",
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
        setError(`Server error: ${response.status}`);
        return;
      }

      const sessionsData = await response.json();

      const formattedSessions = sessionsData.map((session: any) =>
        formatSession(session)
      );
      setSessions(formattedSessions);
    } catch (error) {
      console.error("Error in getUserSessionInfo:", error);
      setError("Failed to load sessions data");
    } finally {
      setIsLoading(false);
    }
  }

  const acceptSessionInvite = async (sessionId: string): Promise<boolean> => {
    if (processingSessions[sessionId]) return false;
    
    setProcessingSessions(prev => ({ ...prev, [sessionId]: true }));
    
    try {
      const token = await authService.getToken();
      
      if (!token || !currentUserId) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/sessions/confirm`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUserId,
            sessionId: sessionId
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept session invite");
      }

      await getUserSessionInfo();
      return true;
    } catch (error) {
      console.error("Error accepting session invite:", error);
      return false;
    } finally {
      setProcessingSessions(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const declineSessionInvite = async (sessionId: string): Promise<boolean> => {
    if (processingSessions[sessionId]) return false;
    
    setProcessingSessions(prev => ({ ...prev, [sessionId]: true }));
    
    try {
      const token = await authService.getToken();
      
      if (!token || !currentUserId) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/sessions/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUserId,
            sessionId: sessionId
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to decline session invite");
      }

      await getUserSessionInfo();
      return true;
    } catch (error) {
      console.error("Error declining session invite:", error);
      return false;
    } finally {
      setProcessingSessions(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const PendingSessionsSection = () => {
    const pendingSessions = sessions.filter(session => {
      const userStatus = session.participants?.find(participant => 
        participant.user === currentUserId || participant.user._id === currentUserId
      );
      return userStatus?.sessionStatus === "pending";
    });

    if (!currentUserId || pendingSessions.length === 0) return null;

    return (
      <View style={styles.pendingSection}>
        <Text style={styles.sectionHeader}>Pending Session Invites</Text>
        {pendingSessions.map((session) => (
          <View key={`pending-${session._id}`} style={styles.pendingCard}>
            <View style={styles.pendingCardContent}>
              <Image 
                source={session.gameImage || require("@/assets/images/games/fifa.png")} 
                style={styles.pendingGameImage} 
              />
              <View style={styles.pendingTextContent}>
                <Text style={styles.pendingGameTitle}>{session.gameName}</Text>
                <Text style={styles.pendingDescription} numberOfLines={1}>
                  {session.description || "Untitled Session"}
                </Text>
                <Text style={styles.pendingDate}>
                  {formatDate(session.scheduledAt)}
                </Text>
              </View>
            </View>
            
            <View style={styles.pendingActions}>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => declineSessionInvite(session._id)}
                disabled={processingSessions[session._id]}
              >
                {processingSessions[session._id] ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.declineButtonText}>Decline</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => acceptSessionInvite(session._id)}
                disabled={processingSessions[session._id]}
              >
                {processingSessions[session._id] ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.acceptButtonText}>Accept</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sessions</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading sessions...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getUserSessionInfo}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#4B5563" />
          <Text style={styles.emptyText}>No sessions found</Text>
          <Text style={styles.emptySubtext}>
            Your game sessions will appear here
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-session")}
          >
            <Text style={styles.createButtonText}>Create a Session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <PendingSessionsSection />
          {sessions
            .filter(session => {
              const userStatus = session.participants?.find(participant => 
                participant.user === currentUserId || participant.user._id === currentUserId
              );
              return userStatus?.sessionStatus !== "pending";
            })
            .map((session) => (
              <SessionCard
                key={session._id}
                gameImage={
                  session.gameImage || require("@/assets/images/games/fifa.png")
                }
                gameTitle={session.gameName || "Game Session"}
                title={session.description || "Untitled Session"}
                date={formatDate(session.scheduledAt) || "No date set"}
                participants={session.participants?.length || 0}
                onPress={() => handleCardPress(session)}
              />
            ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

interface SessionCardProps {
  gameImage: any;
  gameTitle: string;
  title: string;
  date: string;
  participants: number;
  onPress: () => void;
}

const SessionCard = ({
  gameImage,
  gameTitle,
  title,
  date,
  participants,
  onPress,
}: SessionCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <Image source={gameImage} style={styles.gameImage} />
        <View style={styles.textContent}>
          <Text style={styles.gameTitle}>{gameTitle}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={styles.cardInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoText}>{date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoText}>{participants} participants</Text>
            </View>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
          style={styles.arrowIcon}
        />
      </View>
    </TouchableOpacity>
  );
};

function formatDate(dateString: string | undefined) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return (
      date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }) +
      `, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#111827",
  },
  scrollView: {
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 14,
    color: "#7C3AED",
    fontWeight: "600",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
  },
  cardInfo: {
    gap: 6,
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
  arrowIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#9CA3AF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#EF4444",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#7C3AED",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4B5563",
  },
  emptySubtext: {
    marginTop: 5,
    fontSize: 14,
    color: "#9CA3AF",
  },
  createButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#7C3AED",
    borderRadius: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  declineButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pendingSection: {
    marginBottom: 24,
  },
  pendingCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 12, // Slightly reduced padding
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  pendingCardContent: {
    flexDirection: "row",
    alignItems: "center", // Center items vertically
    marginBottom: 12,
  },
  pendingGameImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#374151", // Add a background color for empty images
  },
  pendingTextContent: {
    flex: 1,
    justifyContent: "center",
  },
  pendingGameTitle: {
    fontSize: 14,
    color: "#7C3AED",
    fontWeight: "600",
    marginBottom: 2,
  },
  pendingDescription: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  pendingDate: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  pendingActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 12,
    marginHorizontal: 4,
  },
});
