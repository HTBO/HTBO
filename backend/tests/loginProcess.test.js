const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
let mongoServer;
let login;
let app;
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
}, 30000);

beforeEach(async () => {
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
}, 30000);

afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
}, 30000);

describe("Login process", () => {
    test('Process returns a token', async () => {
        login = await request(app).post('/api/users/login').send({
            "username": "JoeBiden",
            "password": "joe"
        })
        expect(login.body.token.length).toBeGreaterThan(151)
    }),
    test('Login with invalid username and password fails', async () => {
        login = await request(app).post('/api/users/login').send({
            "username": "JoeeBiden",
            "password": "joe"
        })
        expect(login.body.error).toBe("Username or password does not match | ERRC: 200")
    }),
    test('Login with invalid email and password fails', async () => {
        login = await request(app).post('/api/users/login').send({
            "email": "jeoe@biden.com",
            "password": "joe"
        })
        expect(login.body.error).toBe("Email or password does not match | ERRC: 210")
    }),
    test('Login with username and invalid password fails', async () => {
        login = await request(app).post('/api/users/login').send({
            "username": "JoeBiden",
            "password": "je"
        })
        expect(login.body.error).toBe("Username or password does not match | ERRC: 240")
    }),
    test('Login with email and invalid password fails', async () => {
        login = await request(app).post('/api/users/login').send({
            "email": "joe@biden.com",
            "password": "je"
        })
        expect(login.body.error).toBe("Email or password does not match | ERRC: 240")
    }),
    test('Login without username or email and password fails', async () => {
        login = await request(app).post('/api/users/login').send({
            "password": "joe"
        })
        expect(login.body.error).toBe("Please provide an email or username | ERRC: 220")
    }),
    test('Login with username and without password fails', async () => {
        login = await request(app).post('/api/users/login').send({
            "username": "JoeBiden"
        })
        expect(login.body.error).toBe("Please provide the password | ERRC: 230")
    }),
    test('Login without username or email or password fails', async () => {
        login = await request(app).post('/api/users/login').send({
        })
        expect(login.body.error).toBe("Please provide an email or username | ERRC: 220")
    })
})