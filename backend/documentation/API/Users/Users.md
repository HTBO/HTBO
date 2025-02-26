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

# Error codes:
`| ERRC: 01` - No Authorization provided OR Authorization provided, but Bearer is empty

`| ERRC: 02` - Failed to get the token

`| ERRC: 10` - User is not the owner of the account he tries to access

`| ERRC: 20` - User search failed by username

`| ERRC: 21` - User search failed by email

`| ERRC: 22` - User failed to provide username or email

`| ERRC: 23` - Password not provided

`| ERRC: 24` - User's password doesn't match

