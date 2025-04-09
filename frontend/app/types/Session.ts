import type { User } from "./User"

export interface Session {
    _id: string
    hostId: string
    gameId: string
    schduledAt: Date
    description: string
    participants: Array<{
        user: string | User
        status: 'pending' | 'accepted' | 'rejected' | 'host'
    }>
    groups: any[]
    createdAt: Date
    updatedAt: Date
}