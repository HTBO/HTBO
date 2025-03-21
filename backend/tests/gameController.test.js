const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Game = require('../src/models/Game');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
}, 30000);

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
}, 30000);

beforeEach(async () => {
    await Game.deleteMany({});
}, 30000);

describe('Game Controller', () => {
    test('should create a new game', async () => {
        const response = await request(app)
            .post('/api/games')
            .send({
                name: 'CS2',
                description: 'Klasszikus lövöldözős játék',
                publisher: 'Valve',
                releaseYear: 2022,
                stores: [{
                    storeId: new mongoose.Types.ObjectId(),
                    link: 'https://store.steampowered.com/app/730/CounterStrike_2/'
                }]
            });           
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('CS2');
    });

    test('should not create a game with an existing name', async () => {
        await Game.create({
            name: 'CS2',
            description: 'Klasszikus lövöldözős játék',
            publisher: 'Valve',
            releaseYear: 2022,
            stores: [{
                storeId: new mongoose.Types.ObjectId(),
                link: 'https://store.steampowered.com/app/730/CounterStrike_2/'
            }]
        });

        const response = await request(app)
            .post('/api/games')
            .send({
                name: 'CS2',
                description: 'Another description',
                publisher: 'Another publisher',
                releaseYear: 2023,
                stores: [{
                    storeId: new mongoose.Types.ObjectId(),
                    link: 'https://store.steampowered.com/app/730/CounterStrike_2/'
                }]
            });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("The game's name is already taken");
    });

    test('should get a game by ID', async () => {
        const game = await Game.create({
            name: 'CS2',
            description: 'Klasszikus lövöldözős játék',
            publisher: 'Valve',
            releaseYear: 2022,
            stores: [{
                storeId: new mongoose.Types.ObjectId(),
                link: 'https://store.steampowered.com/app/730/CounterStrike_2/'
            }]
        });

        const response = await request(app).get(`/api/games/${game._id}`);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('CS2');
    });

    test('should return 404 if game not found', async () => {
        const response = await request(app).get(`/api/games/${new mongoose.Types.ObjectId()}`);
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Game not found');
    });

    test('should get all games', async () => {
        await Game.create({
            name: 'CS2',
            description: 'Klasszikus lövöldözős játék',
            publisher: 'Valve',
            releaseYear: 2022,
            stores: [{
                storeId: new mongoose.Types.ObjectId(),
                link: 'https://store.steampowered.com/app/730/CounterStrike_2/'
            }]
        });

        const response = await request(app).get('/api/games');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
    });

    test('should update a game', async () => {
        const game = await Game.create({
            name: 'CS2',
            description: 'Klasszikus lövöldözős játék',
            publisher: 'Valve',
            releaseYear: 2022,
            stores: [{
                storeId: new mongoose.Types.ObjectId(),
                link: 'https://store.steampowered.com/app/730/CounterStrike_2/'
            }]
        });

        const response = await request(app)
            .patch(`/api/games/${game._id}`)
            .send({ description: 'Updated description' });
        expect(response.status).toBe(200);
        expect(response.body.description).toBe('Updated description');
    });

    test('should delete a game', async () => {
        const game = await Game.create({
            name: 'CS2',
            description: 'Klasszikus lövöldözős játék',
            publisher: 'Valve',
            releaseYear: 2022,
            stores: [{
                storeId: new mongoose.Types.ObjectId(),
                link: 'https://store.steampowered.com/app/730/CounterStrike_2/'
            }]
        });

        const response = await request(app).delete(`/api/games/${game._id}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Game has been deleted');
    });
});
