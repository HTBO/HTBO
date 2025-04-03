### userController.js
## POST
> registerUser
`POST` `{{API_URL}}/users/register`
```
{
"username": "test",
"email": test@test.eu,
"password": "test"
}
```
> loginUser
`POST` `{{API_URL}}/users/login`
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

> logoutUser
`POST` `{{API_URL}}/users/logout`
```
Bearer token needed
```

> refreshToken
`POST` `{{API_URL}}/users/refresh`
```
Bearer token needed
```

---
## GET
> getAllUsers
`GET` `{{API_URL}}/users`

> getUserById
`GET` `{{API_URL}}/users/<userid>`

> getUserByUsername
`GET` `{{API_URL}}/users/<username>`

> getMyInfo
`GET` `{{API_URL}}/users/me`

> getMySessions
`GET` `{{API_URL}}/users/mysessions`

> getMyGroups
`GET` `{{API_URL}}/users/mygroups`

> getMyGames
`GET` `{{API_URL}}/users/mygames`

---

## UPDATE (PATCH)
> updateUser
`PATCH` `{{API_URL}}/users/<userid>`
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
`DELETE` `{{API_URL}}/users/<userid>`
---
