const app = require('../src/app');
const mongoose = require('mongoose');

describe("Connect to real database", () => {
    let server;

    afterEach(async () => {
        // Close the server after each test
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
        // Disconnect from MongoDB
        await mongoose.disconnect();
    });

    test("Connection succeeded", async () => {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            console.error("No database URL defined");
            return;
        }

        const logSpy = jest.spyOn(global.console, 'log');

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected');

        // Start the server on a random available port
        await new Promise((resolve) => {
            server = app.listen(0, () => {
                const port = server.address().port;
                console.log(`Server running on port ${port}`);
                resolve();
            });
        });

        // Verify logs
        expect(logSpy).toHaveBeenCalledTimes(2);
        expect(logSpy).toHaveBeenCalledWith('MongoDB connected');
        expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/^Server running on port \d+$/));
    });
});