const app = require('../src/app');
const mongoose = require('mongoose');

describe("Connect to real database", () => {
    test("Connection succeeded", async () => {
        const PORT = process.env.PORT;
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) console.error("No database URL defined");

        async function connection() {

            await mongoose.connect(MONGODB_URI)
                .then(() => {
                    console.log('MongoDB connected');
                    return new Promise((resolve) => {
                        app.listen(PORT, () => {
                            console.log(`Server running on port ${PORT}`);
                            resolve();
                        });
                    });
                });
        }

        const logSpy = jest.spyOn(global.console, 'log');
        await connection();

        expect(logSpy).toHaveBeenCalledTimes(2);
        expect(logSpy).toHaveBeenCalledWith(`Server running on port ${PORT}`);
        expect(logSpy).toHaveBeenCalledWith('MongoDB connected');

        await mongoose.disconnect();
    });
});
