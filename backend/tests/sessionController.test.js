const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const Session = require('../src/models/Session');
const User = require('../src/models/User');
const Group = require('../src/models/Group');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;
let hostId;
let session;
let gameId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Session.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});

    const host = await User.create({
        username: 'hostuser',
        email: 'hostuser@example.com',
        passwordHash: 'password123'
    });
    hostId = host._id;
    gameId = new mongoose.Types.ObjectId();
    session = await Session.create({
        hostId: hostId,
        gameId: gameId,
        scheduledAt: new Date(),
        description: 'Test session',
        participants: []
    });

    token = jwt.sign({ id: host._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

describe('Session Controller', () => {
    test('should create a new session', async () => {
        const hostToCreate = await User.create({
            username: 'hostuser',
            email: 'hostuser@example.com',
            passwordHash: 'password123'
        });
        let creationToken = jwt.sign({ id: hostToCreate._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const response = await request(app)
            .post('/api/sessions')
            .set('Authorization', `Bearer ${creationToken}`)
            .send({
                hostId: hostToCreate._id.toString(),
                gameId: gameId.toString(),
                scheduledAt: new Date(),
                description: 'Test session',
                participants: []
            });
        expect(response.status).toBe(201);
        expect(response.body.hostId).toBe(hostToCreate._id.toString());
        await User.deleteMany({});
    });

    test('should not create a session with invalid hostId', async () => {
        const hostToCreate = await User.create({
            username: 'hostuser',
            email: 'hostuser@example.com',
            passwordHash: 'password123'
        });
        let creationToken = jwt.sign({ id: hostToCreate._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const response = await request(app)
            .post('/api/sessions')
            .set('Authorization', `Bearer ${creationToken}`)
            .send({
                hostId: 'invalidId',
                gameId: gameId.toString(),
                scheduledAt: new Date(),
                description: 'Test session',
                participants: []
            });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid host ID');
        await User.deleteMany({});
    });

    test('should get all sessions', async () => {
        const response = await request(app)
            .get('/api/sessions')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
    });

    test('should get a session by ID', async () => {
        const response = await request(app)
            .get(`/api/sessions/${session._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(session._id.toString());
    });

    test('should update a session', async () => {
        const response = await request(app)
            .patch(`/api/sessions/${session._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'Updated session' });
        expect(response.status).toBe(200);
        expect(response.body.description).toBe('Updated session');
    });

    test('should delete a session', async () => {
        const response = await request(app)
            .delete(`/api/sessions/${session._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Session deleted successfully');
    });
});
