const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../src/models/User');

let mongoServer;
let app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    app = require('../src/app');
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.create({
        username: "JoeBiden",
        email: "joe@biden.com",
        passwordHash: "joe",
    }, {
        username: "TrumpBiden",
        email: "trump@biden.com",
        passwordHash: "trump",
    });
});

afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
});

describe("User API GET Tests", () => {
    test('GET ALL Users, User count is 2', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });
    test('GET User by ID', async () => {
        const response = await request(app).get('/api/users/username/TrumpBiden');
        expect(response.status).toBe(200);
    })
});

describe("User API PATCH Tests", () => {
    test('Add pending friend, expect the friends array to have a length of 1', async () => {
        const getFriendId = (await request(app).get('/api/users/username/JoeBiden')).body.user._id
        // console.log(getFriendId.body.user._id);
        const getTestUserId = (await request(app).get('/api/users/username/TrumpBiden')).body.user._id
        // console.log(getTestUserId);
        
        const response = await request(app).patch(`/api/users/${getTestUserId}`).send({
            friendAction: {
                action: "add",
                friendId: getFriendId
            }
        });
        expect(response.status).toBe(200);
        expect(response.body.friends.length).toBe(1);
        // console.log(response.body.friends.length);

    })
    test('Confirming friend, expect the friends array to have a length of 1, and the status change to "accepted"', async () => {
        const getFriendId = (await request(app).get('/api/users/username/JoeBiden')).body.user._id
        // console.log(getFriendId.body.user._id);
        const getTestUserId = (await request(app).get('/api/users/username/TrumpBiden')).body.user._id
        // console.log(getTestUserId);
        let response = await request(app).patch(`/api/users/${getTestUserId}`).send({
            friendAction: {
                action: "add",
                friendId: getFriendId
            }
        });
        response = await request(app).patch(`/api/users/${getFriendId}`).send({
            friendAction: {
                action: "update-status",
                friendId: getTestUserId,
                status: "accepted"
            }
        });
        expect(response.status).toBe(200);
        expect(response.body.friends.length).toBe(1);
        expect(response.body.friends[0].status).toBe("accepted")
        // console.log((response.body.friends[0].status));
        // console.log(response.body.friends.length);

    })
    test('Removing pending friend, expect the friends array to have a length of 0', async () => {
        const getFriendId = (await request(app).get('/api/users/username/JoeBiden')).body.user._id
        // console.log(getFriendId.body.user._id);
        const getTestUserId = (await request(app).get('/api/users/username/TrumpBiden')).body.user._id
        // console.log(getTestUserId);
        let response = await request(app).patch(`/api/users/${getTestUserId}`).send({
            friendAction: {
                action: "add",
                friendId: getFriendId
            }
        });
        expect(response.body.friends.length).toBe(1);
        response = await request(app).patch(`/api/users/${getTestUserId}`).send({
            friendAction: {
                action: "remove",
                friendId: getFriendId
            }
        });
        expect(response.status).toBe(200);
        expect(response.body.friends.length).toBe(0);
        // console.log(response.body.friends.length);

    })
    test('Removing accepted friend, expect the friends array to have a length of 0', async () => {
        const getFriendId = (await request(app).get('/api/users/username/JoeBiden')).body.user._id
        // console.log(getFriendId.body.user._id);
        const getTestUserId = (await request(app).get('/api/users/username/TrumpBiden')).body.user._id
        // console.log(getTestUserId);
        let response = await request(app).patch(`/api/users/${getTestUserId}`).send({
            friendAction: {
                action: "add",
                friendId: getFriendId
            }
        });
        expect(response.body.friends.length).toBe(1);
        response = await request(app).patch(`/api/users/${getFriendId}`).send({
            friendAction: {
                action: "update-status",
                friendId: getTestUserId,
                status: "accepted"
            }
        });
        expect(response.body.friends[0].status).toBe("accepted")

        response = await request(app).patch(`/api/users/${getTestUserId}`).send({
            friendAction: {
                action: "remove",
                friendId: getFriendId
            }
        });
        expect(response.status).toBe(200);
        expect(response.body.friends.length).toBe(0);
        // console.log(response.body.friends.length);

    })
    test('Prevent users from adding themselves', async () => {
        const getFriendId = (await request(app).get('/api/users/username/JoeBiden')).body.user._id
        // console.log(getFriendId.body.user._id);
        const getTestUserId = (await request(app).get('/api/users/username/JoeBiden')).body.user._id
        // console.log(getTestUserId);
        
        const response = await request(app).patch(`/api/users/${getTestUserId}`).send({
            friendAction: {
                action: "add",
                friendId: getFriendId
            }
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Users cannot add themselves');
        // console.log(response.body.friends.length);

    })
    test('Prevent users from adding same friend multiple times', async () => {
        const getFriendId = (await request(app).get('/api/users/username/JoeBiden')).body.user._id
        // console.log(getFriendId.body.user._id);
        const getTestUserId = (await request(app).get('/api/users/username/TrumpBiden')).body.user._id
        // console.log(getTestUserId);
        
        let response = await request(app).patch(`/api/users/${getTestUserId}`).send({
            friendAction: {
                action: "add",
                friendId: getFriendId
            }
        });
        expect(response.body.friends.length).toBe(1);
        response = await request(app).patch(`/api/users/${getTestUserId}`).send({
            friendAction: {
                action: "add",
                friendId: getFriendId
            }
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('User already added');
        // console.log(response.body.friends.length);

    })
});
    describe("User API DELETE Tests", () => {
        test('Delete first test user, expected user count is 1', async () => {
            const getUserIdToDelete = (await request(app).get('/api/users/username/JoeBiden')).body.user._id
            let response = await request(app).delete(`/api/users/${getUserIdToDelete}`);
            expect(response.status).toBe(200);
            response = await request(app).get('/api/users');
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
        });

});