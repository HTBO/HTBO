### gamesController.js
## POST
> createGame
`POST` `{{API_URL}}/games`
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
`GET` `{{API_URL}}/games`

> getGameById
`GET` `{{API_URL}}/games/<gameid>`
---

## UPDATE (PATCH)
> updateGame
`PATCH` `{{API_URL}}/games/<gameid>`
- Game updates:
    - name
    - description
    - publisher
    - releaseYear
    - stores

---
## DELETE
> deleteGame
`DELETE` `{{API_URL}}/games/<gameid>`
