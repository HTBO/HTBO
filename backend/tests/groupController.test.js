const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Group = require('../src/models/Group');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let mongoServer;
let token;
let userId;

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
    await User.deleteMany({});
    await Group.deleteMany({});
    const user = await User.create({
        username: 'testuser',
        email: 'testuser@example.com',
        passwordHash: await bcrypt.hash('password123', 10)
    });
    userId = user._id;
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

describe('Group Controller', () => {
    test('should create a new group', async () => {
        const response = await request(app)
            .post('/api/groups')
            .set('Authorization', `Bearer ${token}`)
            .send({
                ownerId: userId,
                name: 'Test Group',
                description: 'A test group',
                members: []
            });
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Test Group');
    });

    test('should not create a group with an existing name', async () => {
        await Group.create({
            ownerId: userId,
            name: 'Test Group',
            description: 'A test group',
            members: []
        });

        const response = await request(app)
            .post('/api/groups')
            .set('Authorization', `Bearer ${token}`)
            .send({
                ownerId: userId,
                name: 'Test Group',
                description: 'Another test group',
                members: []
            });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("The group's name is already taken");
    });

    test('should get all groups', async () => {
        await Group.create({
            ownerId: userId,
            name: 'Test Group 1',
            description: 'A test group',
            members: []
        });
        await Group.create({
            ownerId: userId,
            name: 'Test Group 2',
            description: 'Another test group',
            members: []
        });

        const response = await request(app)
            .get('/api/groups')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });

    test('should get a group by ID', async () => {
        const group = await Group.create({
            ownerId: userId,
            name: 'Test Group',
            description: 'A test group',
            members: []
        });

        const response = await request(app)
            .get(`/api/groups/${group._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Test Group');
    });

    test('should update a group', async () => {
        const group = await Group.create({
            ownerId: userId,
            name: 'Test Group',
            description: 'A test group',
            members: []
        });

        const response = await request(app)
            .patch(`/api/groups/${group._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated Group' });
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Updated Group');
    });

    test('should delete a group', async () => {
        const group = await Group.create({
            ownerId: userId,
            name: 'Test Group',
            description: 'A test group',
            members: []
        });

        const response = await request(app)
            .delete(`/api/groups/${group._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Group deleted successfully');
    });
});
