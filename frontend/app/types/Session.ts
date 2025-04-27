import type { Game } from "./Game"
import type { User } from "./User"

export interface Session {
    id: string
    hostId: string
    host?: User
    gameId: string
    game?: Game
    scheduledAt: Date
    description: string
    participants: Array<{
        user: string | User
        sessionStatus: 'pending' | 'accepted' | 'host'
        userData?: User
    }>
    groups: any[]
    createdAt: Date
    updatedAt: Date
}

export type SessionUserStatus = 'pending' | 'accepted' | 'host' | 'none'

export interface SessionTag {
    tag: 'Live' | 'Starting Soon' | 'Upcoming'
    color: string
}