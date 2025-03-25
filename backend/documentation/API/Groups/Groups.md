### groupController.js
# Requests: 
## POST
> createGroup
`POST http://localhost:5000/api/groups`

Single or multiple member additions at the same time,
userid3 is optional
```
{
    "ownerId": "<userid>",
    "name": "<name>",
    "description": "<description>",
    "members": [
    {
        "memberId": "<userid2>"
    },
    {
        "memberId": "<userid3>"
    }
    ]
}
```

## GET
> getAllGroups
`GET http://localhost:5000/api/groups`

> getSessionById
`GET http://localhost:5000/api/groups/<groupid>`
---
## UPDATE (PATCH)
> updateGroup
`PATCH http://localhost:5000/api/groups/<groupid>`
- Group updates:
    - name
    - description

``
{
"name": "<name>"
}
``

``
{
"description": "<description>"
}
``

- addParticipant
userid2 are optional
```
{
    "addMember": [
        { 
            "memberId": "<userid1>" 
        },
        {
            "memberId": "<userid2>"
        }
    ]
}
```
- removeMember
userid2 are optional

```
{
    "removeMember": [
    {
        "memberId": "<userid>"
    },
    {
        "memberId": "<userid2>"
    }
    ]
}
```
---
## DELETE
> deleteGroup
`DELETE http://localhost:5000/api/groups/<groupid>`
---

