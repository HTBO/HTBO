export interface SessionInfo {
    sessionId: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
  }
  
  export type ImageSource = string | { uri: string } | number | null;
  
  export interface UserModel {
    _id: string;
    id?: string;
    username: string;
    email: string;
    avatarUrl?: string | null;
    friends: string[] | any[];
    games: string[] | any[];
    sessions: SessionInfo[];
    groups: string[] | any[];
    createdAt: string;
    updatedAt: string;
    profileUrl?: string;
  }
  
  // Default values for creating a new user or initializing state
  export const defaultUser: UserModel = {
    _id: '',
    username: '',
    email: '',
    avatarUrl: null,
    friends: [],
    games: [],
    sessions: [],
    groups: [],
    createdAt: '',
    updatedAt: '',
    profileUrl: ''
  };