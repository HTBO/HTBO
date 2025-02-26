# TODO
### Notifications
    - Notifications.js
    - notificationsController.js
    - notificationsRoutes.js
---
### Sessions

> prio
### sessionController: 
    - PATCH sessions: if one (or more) mistake made during addition or deletion, the modifications may fail
    ##handled## - PATCH sessions: invite through groups, invite every member of the group
    ##handled## - Create sessions: invite through groups, optional, invite every member of the group
    ##handled## - PATCH sessions: change gameId, description, time
---
### Users
    ##handled## - User deletion should affect sessions and groups
    ##handled by login## - User and Friend adding, FRONTEND handling (User can confirm the Friend's add) 

### userAPI.test.js
    - Email/Name already taken

### Tests
    - gameHandling
    - groupHandling
    - sessionHandling