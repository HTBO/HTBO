const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const supertest = require('supertest');

let mongoServer;
let app;
let userToken;
let testOneId;
let testTwoId

beforeAll(async () => {
    try {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        app = require('../src/app');
    } catch (error) {
        console.error("Error in beforeAll:", error);
        throw error;
    }
}, 30000);

afterAll(async () => {
    try {
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
    } catch (error) {
        console.error("Error in afterAll:", error);
        throw error;
    }
});

beforeEach(async () => {
    // await User.create({
    //     username: "JoeBiden",
    //     email: "joe@biden.com",
    //     passwordHash: "joe",
    // }, {
    //     username: "TrumpBiden",
    //     email: "trump@biden.com",
    //     passwordHash: "trump",
    // });
    await request(app).post('/api/users/register').send({
        "username": "JoeBiden",
        "email": "joe@biden.com",
        "password": "joe"
    })
    await request(app).post('/api/users/register').send({
        "username": "TrumpBiden",
        "email": "trump@biden.com",
        "password": "trump"
    })
    const login = await request(app).post('/api/users/login').send({
        "username": "JoeBiden",
        "password": "joe"
    })
    userToken = login.body.token;
    console.log(await request(app).get('/api/users/username/JoeBiden').set('Authorization', `Bearer ${userToken}`));
    
    testOneId = (await request(app).get('/api/users/username/JoeBiden')).body.user._id
    testTwoId = (await request(app).get('/api/users/username/TrumpBiden')).body.user._id
}, 30000);

afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
});

describe("User API GET Tests", () => {
    test('GET ALL Users, User count is 2', async () => {
        const response = await supertest(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });
    test('GET User by username', async () => {
        const response = await supertest(app).get(`/api/users/${testOneId}`).set('Authorization', `Bearer ${userToken}`)
        expect(response.status).toBe(200);
    });
});

describe("User API PATCH Tests", () => {
    test('Add pending friend, expect the friends array to have a length of 1', async () => { 
        const response = await request(app).patch(`/api/users/${testOneId}`).set('Authorization', `Bearer ${userToken}`).send({
            friendAction: {
                action: "add",
                friendId: testTwoId
            }
        });        
        expect(response.status).toBe(200);
        expect(response.body.friends.length).toBe(1);
        // console.log(response.body.friends.length);

    })
    test('Confirming friend, expect the friends array to have a length of 1, and the status change to "accepted"', async () => {
        let response = await request(app).patch(`/api/users/${testOneId}`).set('Authorization', `Bearer ${userToken}`).send({
            friendAction: {
                action: "add",
                friendId: testTwoId
            }
        });
        const login = await request(app).post('/api/users/login').send({
            "username": "TrumpBiden",
            "password": "trump"
        })
        let testTwoToken = login.body.token;
        response = await request(app).patch(`/api/users/${testTwoId}`).set('Authorization', `Bearer ${testTwoToken}`).send({
            friendAction: {
                action: "update-status",
                friendId: testOneId,
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
        let response = await request(app).patch(`/api/users/${testOneId}`).set('Authorization', `Bearer ${userToken}`).send({
            friendAction: {
                action: "add",
                friendId: testTwoId
            }
        });
        expect(response.body.friends.length).toBe(1);
        response = await request(app).patch(`/api/users/${testOneId}`).set('Authorization', `Bearer ${userToken}`).send({
            friendAction: {
                action: "remove",
                friendId: testTwoId
            }
        });
        expect(response.status).toBe(200);
        expect(response.body.friends.length).toBe(0);
        // console.log(response.body.friends.length);

    })
    test('Removing accepted friend, expect the friends array to have a length of 0', async () => {
        let response = await request(app).patch(`/api/users/${testOneId}`).set('Authorization', `Bearer ${userToken}`).send({
            friendAction: {
                action: "add",
                friendId: testTwoId
            }
        });
        expect(response.body.friends.length).toBe(1);
        response = await request(app).patch(`/api/users/${testOneId}`).set('Authorization', `Bearer ${userToken}`).send({
            friendAction: {
                action: "update-status",
                friendId: testTwoId,
                status: "accepted"
            }
        });
        expect(response.body.friends[0].status).toBe("accepted")
        const login = await request(app).post('/api/users/login').send({
            "username": "TrumpBiden",
            "password": "trump"
        })
        let testTwoToken = login.body.token;
        response = await request(app).patch(`/api/users/${testTwoId}`).set('Authorization', `Bearer ${testTwoToken}`).send({
            friendAction: {
                action: "remove",
                friendId: testOneId
            }
        });
        expect(response.status).toBe(200);
        expect(response.body.friends.length).toBe(0);
        // console.log(response.body.friends.length);

    })
    test('Prevent users from adding themselves', async () => {
        const response = await request(app).patch(`/api/users/${testOneId}`).set('Authorization', `Bearer ${userToken}`).send({
            friendAction: {
                action: "add",
                friendId: testOneId
            }
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Users cannot add themselves');
        // console.log(response.body.friends.length);

    })
    test('Prevent users from adding same friend multiple times', async () => {
        let response = await request(app).patch(`/api/users/${testOneId}`).set('Authorization', `Bearer ${userToken}`).send({
            friendAction: {
                action: "add",
                friendId: testTwoId
            }
        });
        expect(response.body.friends.length).toBe(1);
        response = await request(app).patch(`/api/users/${testOneId}`).set('Authorization', `Bearer ${userToken}`).send({
            friendAction: {
                action: "add",
                friendId: testTwoId
            }
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('User already added');
        // console.log(response.body.friends.length);

    })
});
    describe("User API DELETE Tests", () => {
        test('Delete first test user, expected user count is 1', async () => {
            let response = await request(app).delete(`/api/users/${testOneId}`).set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            response = await request(app).get('/api/users');
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
        });

});