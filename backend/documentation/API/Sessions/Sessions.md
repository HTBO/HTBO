### sessionController.js
## POST
> createSession
`POST` `{{API_URL}}/sessions`

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
`GET` `{{API_URL}}/sessions`

> getSessionById
`GET` `{{API_URL}}/sessions/<sessionid>`
---
## UPDATE (PATCH)
> updateSession
`PATCH` `{{API_URL}}/sessions/<sessionid>`
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
`DELETE` `{{API_URL}}/sessions/<sessionid>`
---
