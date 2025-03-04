### sessionController.js
## POST
> createSession
`POST http://localhost:5000/api/sessions`

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
`GET http://localhost:5000/api/sessions`

> getSessionById
`GET http://localhost:5000/api/sessions/<sessionid>`
---
## UPDATE (PATCH)
> updateSession
`PATCH http://localhost:5000/api/sessions/<sessionid>`
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
        { "group": "<groupid1>" },
        { "user": "<userid1>" },
        { "user": "<userid2>" },
        { "group": "<groupid2>" }
        
    ]
}
```
- removeParticpant

```
{
    "removeParticipant": [
    {
        "user": "<userid>"
    },
    {
        "group": "<groupid2>" 
    }
    ]
}
```
---
## DELETE
> deleteSession
`DELETE http://localhost:5000/api/sessions/<sessionid>`
---

# Error codes:
`| ERRC: 01` - No Authorization provided OR Authorization provided, but Bearer is empty

`| ERRC: 02` - Failed to get the token

`| ERRC: 10` - User is not the host of the session he tries to access