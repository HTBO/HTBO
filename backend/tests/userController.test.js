const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let mongoServer;
let token;

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
    const user = await User.create({
        username: 'testuser',
        email: 'testuser@example.com',
        passwordHash: await bcrypt.hash('password123', 10)
    });
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

describe('User Controller', () => {
    test('should register a new user', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123'
            });
        expect(response.status).toBe(201);
        expect(response.body.username).toBe('newuser');
    });

    test('should not register a user with an existing username', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'testuser',
                email: 'newemail@example.com',
                password: 'password123'
            });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Username already exists');
    });

    test('should login a user with valid credentials', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({
                username: 'testuser',
                password: 'password123'
            });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    test('should not login a user with invalid credentials', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword'
            });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Username or password does not match | ERRC: 24');
    });

    test('should get all users', async () => {
        const response = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
    });

    test('should get a user by ID', async () => {
        const user = await User.findOne({ username: 'testuser' });
        const response = await request(app)
            .get(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('testuser');
    });

    test('should update a user', async () => {
        const user = await User.findOne({ username: 'testuser' });
        const response = await request(app)
            .patch(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ username: 'updateduser' });
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('updateduser');
    });

    test('should delete a user', async () => {
        const user = await User.findOne({ username: 'testuser' });
        const response = await request(app)
            .delete(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    });
});
