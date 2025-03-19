### gamesController.js
## POST
> createGame
`POST http://localhost:5000/api/games`
```
{
"name": "testgame",
"description": "testdescription",
"publisher": "testpublisher",
"releaseYear": 2009,
"stores": [{
    "storeId": "testStoreMongoId",
    "link": "gamesLinkOnStore"
}]
}
```
---
## GET
> getAllGames
`GET http://localhost:5000/api/games`

> getGameById
`GET http://localhost:5000/api/games/<gameid>`
---

## UPDATE (PATCH)
> updateGame
`PATCH http://localhost:5000/api/games/<gameid>`
- Game updates:
    - name
    - description
    - publisher
    - releaseYear
    - stores

---
## DELETE
> deleteGame
`DELETE http://localhost:5000/api/games/<gameid>`
