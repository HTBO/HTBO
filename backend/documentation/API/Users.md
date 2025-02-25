### userController.js
## POST
> registerUser
`POST http://localhost:3000/api/users`
```
{
"username": "test",
"email": test@test.eu,
"password": "test"
}
```
> loginUser
`POST http://localhost:3000/api/users`
```
{
"username": "test",
"password": "test"
}
OR
{
"email": test@test.eu,
"password": "test"
}
```
---
## GET
> getAllUsers
`GET http://localhost:3000/api/users`

> getUserById
`GET http://localhost:3000/api/users/<userid>`

> getUserByUsername
`GET http://localhost:3000/api/users/<username>`
---

## UPDATE (PATCH)
> updateUser
`PATCH http://localhost:3000/api/users/<userid>`
- User updates:
    - username
    - email
```
"username": "<newusername>"
---
"email": "<newemail>"
```

- friendAction
```
{
    "friendAction": {
        "action": "add", 
        "friendId": "<friendid>"
    }
}
---
{
    "friendAction": {
        "action": "update-status", 
        "friendId": "<friendid>",
        "status": "accepted"
    }
}
---
{
    "friendAction": {
        "action": "remove", 
        "friendId": "<friendid>"
    }
}
```
- gameAction
```
{
    "gameAction": {
        "action": "add", 
        "gameId": "<gameid>"
    }
}
---
{
    "gameAction": {
        "action": "remove", 
        "gameId": "<gameid>"
    }
}
```
- sessionAction
```
{
    "sessionAction": {
        "action": "add",
        "sessionId": "<sessionId>"
    }
}
---
{
    "sessionAction": {
        "action": "remove",
        "sessionId": "<sessionId>"
    }
}
```
---
## DELETE
> deleteUser
`DELETE http://localhost:3000/api/users/<userid>`
---