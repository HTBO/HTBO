const igdbHeaders = {
    'Accept': 'application/json',
    'Client-ID': process.env.IGDB_CLIENT_ID,
    'Authorization': `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
}

const searchGame = async (req, res) => {
    const { name, id } = req.body;
    if (name && id) return res.status(400).json({ error: 'Please provide either a name or an ID, not both' });
    if (!name && !id) return res.status(400).json({ error: 'Please provide a name or an ID' });
    let searchResponse = null;
    let gamesData = null;
    if (name) {
        if (name.length < 2) return res.status(400).json({ error: 'Name must be at least 3 characters long' });
        if (name.length > 50) return res.status(400).json({ error: 'Name must be at most 50 characters long' });
        if (!/^[a-zA-Z0-9\s]+$/.test(name)) return res.status(400).json({ error: 'Name can only contain alphanumeric characters' });
        searchResponse = await fetch(
            "https://api.igdb.com/v4/games",
            {
                method: 'POST',
                headers: igdbHeaders,
                body: `search \"${name}\"; fields name, cover.url, summary, involved_companies.company.name, rating, rating_count; limit 50; where rating != 0;`
            })
            .catch(err => {
                console.error(err);
            });
    } else if (id) {
        searchResponse = await fetch(
            "https://api.igdb.com/v4/games",
            {
                method: 'POST',
                headers: igdbHeaders,
                body: `where id = ${id}; fields name, cover.url, summary, involved_companies.company.name, rating, rating_count; limit 50;`
            })
            .catch(err => {
                console.error(err);
            });
    }
    gamesData = await searchResponse.json();
    if (!gamesData?.length) return res.status(404).json({ error: 'No games found' });
    const gamesList = [];
    for (let i = 0; i < gamesData.length; i++) {
        const game = gamesData[i];
        gamesList.push(game.name);
    }

    const sortedGames = await gamesData
        .flat()
        .sort((a, b) => (b.rating_count || -Infinity) - (a.rating_count || -Infinity))
        .map(game => ({
            ...game, rating: game.rating ?? "Unrated", cover: game.cover ? game.cover.url.replace("t_thumb", "t_cover_big") : "//www.igdb.com/assets/no_cover_show-ef1e36c00e101c2fb23d15bb80edd9667bbf604a12fc0267a66033afea320c65.png",
            summary: game.summary ?? "No summary available",
        }));
    return res.status(200).json(sortedGames);
}

module.exports = {
    searchGame
};