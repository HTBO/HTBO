import { ImageSource } from './UserModel';

export interface Participant {
  userId: string;
  username?: string;
  status: 'accepted' | 'pending' | 'declined';
}

export interface SessionModel {
  _id: string;
  id?: string;
  hostId: string;
  hostName?: string;
  hostAvatar?: ImageSource;
  gameId: string;
  gameName?: string;
  gameImage?: ImageSource;
  description: string;
  scheduledAt: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}

// Default values for initializing session state
export const defaultSession: SessionModel = {
  _id: '',
  hostId: '',
  gameId: '',
  description: 'Not described',
  scheduledAt: '',
  participants: [],
  createdAt: '',
  updatedAt: ''
};

// Session list type for state management
export type SessionList = SessionModel[];

// Helper function to format a raw session from API
export function formatSession(rawSession: any): SessionModel {
  return {
    ...rawSession,
    gameImage: rawSession.gameImage ? { uri: rawSession.gameImage } : null,
    hostAvatar: rawSession.hostAvatar ? { uri: rawSession.hostAvatar } : null,
    participants: rawSession.participants || []
  };
}