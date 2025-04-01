# Error codes:
 - | ERRC: 0xx - Token errors
 - | ERRC: 1xx - Authorization errors
 - | ERRC: 2xx - Login errors

## ERRC: 0xx - Token errors
`| ERRC: 010` - No Authorization provided OR Authorization provided, but Bearer is empty

`| ERRC: 020` - Failed to get the token

`| ERRC: 030` - Trying to access with a previously revoked token

`| ERRC: 031` - Cannot find user by token

`| ERRC: 032` - Token expired - Login again

`| ERRC: 033` - Invalid token - Wrong token

## ERRC: 1xx - Authorization errors

`| ERRC: 100` - User is not the owner of the account he tries to access

`| ERRC: 110` - User is not the host of the session he tries to access

`| ERRC: 120` - User is not the owner of the group he tries to access

## ERRC: 2xx - Login errors


`| ERRC: 200` - User login attempt failed by wrong username

`| ERRC: 210` - User login attempt failed by wrong email

`| ERRC: 220` - User failed to provide username or email

`| ERRC: 230` - Password not provided

`| ERRC: 240` - User's password doesn't match




