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
        sessionStatus: 'pending' | 'accepted' | 'rejected' | 'host'
    }>
    groups: Array<{
        groupId: string,
        groupStatus: 'pending' | 'accepted' | 'rejected' | 'owner'
    }>
    created_at: string
    updated_at: string
}