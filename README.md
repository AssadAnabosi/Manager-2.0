# Manager

##### Version: 2.0.0

## Backstory

This app is built upon the need for a database for my family's own workshop, so it was designed to fit the purposes of those needs, at first as a Highschool kid (back in 2018-2019) all I was able to do is a Microsoft Office Access database, and it worked mostly fine for a few years, but the need for a database that can be accessed from different locations by different people started to appear, all of that and the sudden DB file corruption (can't say I didn't expect that the day I designed it on MS Access) made me realize that I need to finally do an upgrade and move it be an Online web app, so Jun. 2022 started working on that with zero background on how to do it, fast forward Dec. 2022 my very first web app, is up and running, and all the old data that survived the corruption have been ported over via a custom app that was specifically created to do this job. I't s double win for me, I learned how to make a Web App Service, and i have a better DB for the workshop.

## Definitions

- **User**: is the **Worker** that is allowed to access the app, and perform the actions that are allowed to them.
  - **firstName**`*`: is the first name of the user.
  - **lastName**`*`: is the last name of the user.
  - **username**`*`: is the username of the user.
  - **email**: is the email of the user.
  - **phoneNumber**: is the phone number of the user.
  - **password**`*`: is the password of the user.
  - **active**: is a flag that is set to decide whether the user is allowed to login or not.
  - **role**: are the different roles that a **Worker** can have, different roles gives the ability to do more or less actions they can perform.
    1. **User**: can only view his own logs and change his password.
    2. **Spectator**: can view all the bills, workers, logs, payees and cheques, but can't edit anything besides his own password.
    3. **Moderator**: can do what a **Spectator** can do, and can add new records, but with restricted deletion and editing abilities, where he can't delete a worker, or update a worker's role, change the activation status a worker account, or reset a worker's account password.
    4. **Administrator**: Highest level of access can do anything.
- **Log**: is the record of the work that is done by the worker.
  - **date**`*`: is the date that the work was done.
  - **isAbsent**: is a flag that is set to true when the worker is absent.
  - **description**: is the description of the work that was done.
  - **startingTime**: is the time that the work started.
  - **finishingTime**: is the time that the work finished.
  - **OTV**: is the amount of overtime that the worker worked.
  - **payment**: is the amount of money that the worker got paid.
  - **extraNotes**: is an optional extra notes about the work.
  - **worker**`*`: is the worker who this log is associated with.
- **Payee**: is the person or company that the **Cheque** is made out to.
  - **name**`*`: is the name of the payee.
  - **email**: is the email of the payee.
  - **phoneNumber**: is the phone number of the payee.
  - **extraNotes**: is an optional extra notes about the payee.
- **Cheque**: is the payment method that is used to pay the **Payee**.
  - **serial**`*`: is the number that is written on the cheque.
  - **dueDate**`*`: is the date that the cheque is due to be cashed.
  - **value**`*`: is the amount that is written on the cheque.
  - **description**: is an optional description of the cheque.
  - **payee**: is the payee that the cheque is made out to.
  - **isCancelled**: is a flag that is set to true when the cheque is cancelled.
- **Bill**: is the expenses that are made by the workshop.
  - **date**`*`: is the date that the bill was made.
  - **value**`*`: is the amount that the bill is for.
  - **description**`*`: is the description of the bill.
  - **extraNotes**: is an optional extra notes about the bill.
- **Session**: is the record of the sessions that are made by the users.
  - **refreshToken**`*`: is the refresh token that is used to generate new access tokens.
  - **user**`*`: is the user that the refresh token is associated with.
  - **expiresAt**`*`: is the date that the refresh token expires.
- `*`Required field
- When a worker gets deleted, all the logs that are associated with that worker are also deleted.
- When a payee gets deleted, all the cheques that are associated with that payee are has payee set to null.
- When a user logout his refresh token is revoked.

### Restrictions

- User

  - Administrator can't delete himself.
  - Administrator can't deactivate himself.
  - Administrator can't change his own role.
  - Administrator resting a user password revokes all of his refresh tokens.

- Log
  - Log worker and date both can't be changed.
  - Log updating or creation can either have a startingTime and a finishingTime, or isAbsent = true. but you can't have both or neither.
- Cheque
  - Cheque serial number can't be changed.

### Authentication

- The authentication is done using JWT and cookies
  - When user sign in he gets a refresh token and an access token, the refresh token is stored in the httpOnly cookies
  - The access token is used to authenticate the user, and the refresh token is used to generate new access tokens.
  - Any request that is made to the server must have the access token in the Authorization header. (Bearer Token)

## Used Technologies / Libraries

- NodeJS
- ExpressJS
- MongoDB
- Mongoose
- BcryptJS
- JsonWebToken
- Dotenv
- Nodemon
- Cors
- Cookies

## Configuration and Setup

- In `/server/config` Fill the `config.env.template` file with the needed information, and rename it to `config.env`
  - `NODE_ENV`: is the environment that the server will run on. [development, production]
  - `PORT`: is the port that the server will run on.
  - `MONGO_URI`: is the URI of the MongoDB database.
  - Auth: JWT - Cookies
    - `JWT_ACCESS_SECRET`: is the secret that is used to sign the JWT access tokens.
    - `JWT_ACCESS_EXPIRE`: is the expiration time of the JWT access tokens.
    - `JWT_REFRESH_SECRET`: is the secret that is used to sign the JWT refresh tokens.
    - `MAX_AGE`: is the expiration time if the JWT refresh token and the max age of the cookie.
    - `SECURE_COOKIE`: is a flag that is set to "true" when the cookies are secure.
  - `CLIENT_URL`: is the URL of the client app for cors.
  - Admin Account: Initial Admin Account, will run only when there are no users in the database at the moment of the server start.
    - `ADMIN_USERNAME`: is the username of the admin account.
    - `ADMIN_PASSWORD`: is the password of the admin account.
    - `ADMIN_EMAIL`: is the email of the admin account.
    - `ADMIN_FIRST_NAME`: is the first name of the admin account.
    - `ADMIN_LAST_NAME`: is the last name of the admin account.
    - `ADMIN_PHONE_NUMBER`: is the phone number of the admin account.
- Run directly on your machine
  - Run `npm install` to install all the needed dependencies
  - Run `npm run server` to start the server in development mode (nodemon)
- Run using docker and docker-compose
  </br>
  Note that you need to have docker and docker-compose installed on your machine
  </br>
  - Run `make compose`
    - Or Run `docker-compose up --build -d` if you don't have make installed on your machine.

</br>
</br>
</br>

# API Routes

### Auth

| Method | Route             |
| ------ | ----------------- |
| POST   | /api/auth         |
| GET    | /api/auth/refresh |
| POST   | /api/auth/logout  |
| GET    | /api/auth/me      |

### Users

| Method | Route                             |
| ------ | --------------------------------- |
| POST   | /api/users                        |
| GET    | /api/users?search=                |
| GET    | /api/users/:userID                |
| PUT    | /api/users/:userID                |
| DELETE | /api/users/:userID                |
| POST   | /api/users/check-username         |
| PATCH  | /api/users/change-password        |
| PATCH  | /api/users/:userID/reset-password |
| PATCH  | /api/users/:userID/role           |
| PATCH  | /api/users/:userID/active-status  |

### Logs

| Method | Route                         |
| ------ | ----------------------------- |
| POST   | /api/logs                     |
| GET    | /api/logs?start=&end=&search= |
| GET    | /api/logs/:logID              |
| PUT    | /api/logs/:logID              |
| DELETE | /api/logs/:logID              |

### Payees

| Method |                      |
| ------ | -------------------- |
| POST   | /api/payees          |
| GET    | /api/payees?search=  |
| GET    | /api/payees/:payeeID |
| PUT    | /api/payees/:payeeID |
| DELETE | /api/payees/:payeeID |

### Cheques

| Method | Route                            |
| ------ | -------------------------------- |
| POST   | /api/cheques                     |
| GET    | /api/cheques?start=&end=&search= |
| GET    | /api/cheques/:chequeID           |
| PUT    | /api/cheques/:chequeID           |
| DELETE | /api/cheques/:chequeID           |

### Bills

| Method | Route                          |
| ------ | ------------------------------ |
| POST   | /api/bills                     |
| GET    | /api/bills?start=&end=&search= |
| GET    | /api/bills/:billID             |
| PUT    | /api/bills/:billID             |
| DELETE | /api/bills/:billID             |
