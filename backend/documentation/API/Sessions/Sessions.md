### sessionController.js
## POST
> createSession
`POST http://localhost:3000/api/sessions`

Single or multiple participant additions at the same time,
userid2 and groupid2 is optional
```
{
    "hostId": "<host_id>",
    "gameId": "<game_id>",
    "scheduledAt": "<newDate>",
    "description": "<description>",
    "participants": [
        { "user": "<userid1>" },
        { "user": "<userid2>" },
        { "group": "<groupid1>" },
        { "group": "<groupid2>" }
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
"description": "<description>"
}
``

- addParticipant
userid2 and groupid2 are optional
```
{
    "addParticipant": [
        { "group": "groupid1" },
        { "user": "userid1" },
        { "user": "userid2" },
        { "group": "groupid2" }
        
    ]
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