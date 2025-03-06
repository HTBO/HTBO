// Middleware/validateGame.js
const validateGame = (req, res, next) => {
    const { name, releaseYear } = req.body;
    
    if (!name || name.length > 100) {
        return res.status(400).json({ error: 'Invalid game name' });
    }
    
    if (!Number.isInteger(releaseYear) {
        return res.status(400).json({ error: 'Invalid release year' });
    }
    
    next();
};