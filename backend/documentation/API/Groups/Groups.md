### groupController.js
# Requests: 
## POST
> createGroup
`POST http://localhost:3000/api/groups`

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
`GET http://localhost:3000/api/groups`

> getSessionById
`GET http://localhost:3000/api/groups/<groupid>`
---
## UPDATE (PATCH)
> updateGroup
`PATCH http://localhost:3000/api/groups/<groupid>`
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
`DELETE http://localhost:3000/api/groups/<groupid>`
---

# Error codes:
`| ERRC: 01` - No Authorization provided OR Authorization provided, but Bearer is empty

`| ERRC: 02` - Failed to get the token

`| ERRC: 40` - User not the owner of the group