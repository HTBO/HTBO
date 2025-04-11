const Group = require('../models/Group');
const User = require('../models/User');
const Session = require('../models/Session');

async function getGroups(userId) {
    try {
        const user = await User.findById(userId);
        let groups = await Group.find({ ownerId: user._id })
            .populate('ownerId', 'username')
            .populate('members.memberId', 'username');
        
        const memberGroups = await Group.find({ 'members.memberId': user._id })
            .populate('ownerId', 'username')
            .populate('members.memberId', 'username');
        
        groups.push(...memberGroups);
        return groups;
    } catch (err) {
        console.error(err.message);
        return err;
    }
}

async function getGroupMembersById(groupId) {
    try {
        console.log('groupId', groupId);
        
        const group = await Group.findById(groupId);
        console.log('group', group);
        
        return group;
    } catch (err) {
        console.error(err.message);
        return err;
    }
}

async function getSessions(userId) {
    try {
        const user = await User.findById(userId);
        let sessions = await Session.find({ hostId: user._id });
        sessions.push(...await Session.find({ 'participants.user': user._id }));
        return sessions;
    } catch (err) {
        console.error(err.message);
        return err;
    }
}

async function getFriends(userId) {
    try {
        const user = await User.findById(userId).populate('friends.userId', 'username profilePicture');
        return user.friends.map(friend => friend.userId);
    } catch (err) {
        console.error(err.message);
        return err;
    }
}


module.exports = {getGroups, getGroupMembersById, getSessions, getFriends};