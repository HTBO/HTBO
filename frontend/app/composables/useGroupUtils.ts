import type { Group, GroupMember } from "~/types/Group"
import type { User } from "~/types/User"

export type GroupMembershipStatus = 'owner' | 'accepted' | 'pending' | 'none'

export const useGroupMembershipStatus = (targetGroup: Group | null, currentUser: User | null) => {
    const getGroupMembershipStatus = (): GroupMembershipStatus => {
        if (!targetGroup || !currentUser) return 'none'

        if (targetGroup.ownerId === currentUser._id) return 'owner'

        const member = targetGroup.members?.find((member: GroupMember) => member.memberId === currentUser._id)

        if (member) {
            return member.groupStatus as GroupMembershipStatus || 'none'
        }

        return 'none'
    }

    const isOwner = (): boolean => {
        return getGroupMembershipStatus() === 'owner'
    }

    const isMember = (): boolean => {
        return getGroupMembershipStatus() === 'accepted'
    }

    const isPending = (): boolean => {
        return getGroupMembershipStatus() === 'pending'
    }

    const isNone = (): boolean => {
        return getGroupMembershipStatus() === 'none'
    }

    

    return {
        getGroupMembershipStatus,
        isOwner,
        isMember,
        isPending,
        isNone,
    }
}

export const useGroupUtils = () => {
    const getAcceptedMembersCount = (group: Group | null): number => {
        if (!group) return 0
        group.members?.filter((member: GroupMember) => member.groupStatus === 'accepted')
        return group.members?.length || 0
    }

    return {
        getAcceptedMembersCount,
    }
};
