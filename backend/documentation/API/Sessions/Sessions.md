### sessionController.js
## POST
> createSession
`POST http://localhost:3000/api/sessions`

Single or multiple participant additions at the same time,
memberid2 is optional
```
{
    "hostId": "<hostid>",
    "gameId": "<gameid>",
    "scheduledAt": "<date>",
    "participants": [
    {
      "user": "<memberid>"
    },
    {
      "user": "<memberid2>"
    }
  ]
}
```
---
## GET
> getAllSessions
`GET http://localhost:3000/api/sessions`

> getSessionById
`GET http://localhost:3000/api/sessions/<sessionid>`
---
## UPDATE (PATCH)
> updateSession
`PATCH http://localhost:3000/api/sessions/<sessionid>`
- Session updates:
    - gameId
    - scheduledAt
    - description

``
{
"gameId": "<newGameId>"
}
``

``
{
"scheduledAt": "<newDate>"
}
``

``
{
"gameId": "<newGameId>"
}
``

- addParticipant
```
{
    "addParticipant": {
        "user": "<userid>"
    }
}
```
- removeParticpant

```
{
    "removeParticipant": {
        "user": "<userid>"
    }
}
```
---
## DELETE
> deleteSession
`DELETE http://localhost:3000/api/sessions/<sessionid>`
---