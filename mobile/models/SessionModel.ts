import { ImageSource } from "./UserModel";

export interface SessionParticipant {
  _id: string;
  username: string;
  email?: string;
  sessionStatus: "pending" | "accepted" | "rejected";
}

export interface SessionModel {
  _id: string;
  description: string;
  gameName: string;
  gameImage?: string;
  hostId: string;
  hostName: string;
  participants: SessionParticipant[];
  scheduledAt: string;
  createdAt: string;
  updatedAt: string;
}

// Default values for initializing session state
export const defaultSession: SessionModel = {
  _id: "",
  description: "",
  gameName: "",
  hostId: "",
  hostName: "",
  participants: [],
  scheduledAt: "",
  createdAt: "",
  updatedAt: "",
};

// Session list type for state management
export type SessionList = SessionModel[];

// Helper function to format a raw session from API
export function formatSession(rawSession: any): SessionModel {
  return {
    ...rawSession,
    gameImage: rawSession.gameImage ? { uri: rawSession.gameImage } : null,
    hostAvatar: rawSession.hostAvatar ? { uri: rawSession.hostAvatar } : null,
    participants: rawSession.participants || [],
  };
}

// Add these models for other parts of the application where relevant

export interface FriendModel {
  _id: string;
  username: string;
  email?: string;
  friendStatus: "pending" | "accepted" | "rejected";
}

export interface GroupMember {
  _id: string;
  username: string;
  email?: string;
  groupStatus: "pending" | "accepted" | "rejected";
}

export interface GroupModel {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}
