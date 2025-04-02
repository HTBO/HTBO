import type { Session } from "./Session"

export interface User {
    _id: string
    username: string
    email: string
    avatarUrl: string
    friends: {
        userId: string | User,
        status: 'pending' | 'accepted' | 'rejected'
    }
    games: any[]
    sessions: {
        sessionId: string,
        status: 'pending' | 'accepted' | 'rejected'
    }
    groups: {
        groupId: string,
        status: 'pending' | 'accepted' | 'rejected'
    }
    created_at: string
    updated_at: string
}