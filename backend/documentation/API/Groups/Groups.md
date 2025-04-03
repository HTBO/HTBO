### groupController.js
# Requests: 
## POST
> createGroup
`POST` `{{API_URL}}/groups`

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
---
> confirmGroup
`POST` `{{API_URL}}/groups/confirm`

Accept invitation to a group
```
{
    "userId": "<userId>",
    "groupId": "<groupId>"
}
```
---
> rejectGroup
`POST` `{{API_URL}}/groups/reject`

Reject invitation to a group, or leave from the gorup (if already a member)
```
{
    "userId": "<userId>",
    "groupId": "<groupId>"
}
```
---
## GET
> getAllGroups
`GET` `{{API_URL}}/groups`

> getSessionByIdíx
`GET` `{{API_URL}}/groups/<groupid>`
---
## UPDATE (PATCH)
> updateGroup
`PATCH` `{{API_URL}}/groups/<groupid>`
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
`DELETE` `{{API_URL}}/groups/<groupid>`
---

