import type { Session } from "./Session"

export interface User {
    _id: string
    username: string
    email: string
    avatarUrl: string
    friends: Array<{
        userId: string | User,
        friendStatus: 'pending' | 'accepted' | 'rejected'
        initiator: boolean
    }>
    games: any[]
    sessions: Array<{
        sessionId: string,
        status: 'pending' | 'accepted' | 'rejected'
    }>
    groups: Array<{
        groupId: string,
        status: 'pending' | 'accepted' | 'rejected'
    }>
    created_at: string
    updated_at: string
}