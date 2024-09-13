# Manager

##### Version: 2.0.0

2nd Version of the [Manager App](https://github.com/AssadAnabosi/Manager) with a much cleaner code base, and higher coding standards.
![cover](https://github.com/user-attachments/assets/229a59ca-342f-4190-a32b-95bb1abd16b7)

## About

PWA that helps digitalize my family's workshop data, like bills, workers' logs, and more.

## Backstory

#### V1.0

This app is built upon the need for a database for my family's own workshop, so it was designed to fit the purposes of those needs, at first as a Highschool kid (back in 2018-2019) all I was able to do is a Microsoft Office Access database, and it worked mostly fine for a few years, but the need for a database that can be accessed from different locations by different people started to appear, all of that and the sudden DB file corruption (can't say I didn't expect that the day I designed it on MS Access) made me realize that I need to finally do an upgrade and move it be an Online web app, so Jun. 2022 started working on that with zero background on how to do it, fast forward Dec. 2022 my very first web app, is up and running, and all the old data that survived the corruption have been ported over via a custom app that was specifically created to do this job. It's a double win for me, I learned how to make a Web App Service, and I have a better DB for the workshop.

#### V2.0

The V1.0 had a lot of issues that were discovered in a later stage, where the codebase was not modular or clean, and the UI was anything but responsive so It was not usable at all on mobile phones and any screen that isn't 1920\*1080. So for V2.0 it was built again from scratch with responsivity in mind for FE, As for BE I made sure that I have a much cleaner code base, and more secure (a better Auth system and more strict validations)

## Definitions

- **User**: is the **Worker** that is allowed to access the app, and perform the actions that are allowed to them.
  - **firstName**`*`: is the first name of the user.
  - **lastName**`*`: is the last name of the user.
  - **username**`*`: is the username of the user.
  - **email**: is the email of the user.
  - **phoneNumber**: is the phone number of the user.
  - **password**`*`: is the password of the user.
  - **active**: is a flag that is set to decide whether the user is allowed to log in or not.
  - **role**: are the different roles that a **Worker** can have, different roles give the ability to do more or less actions they can perform.
    1. **User**: can only view his own logs and change his password and preferences.
    2. **Spectator**: can view all the bills, workers, logs, payees, and cheques, but can't edit anything besides his password and preferences.
    3. **Moderator**: can do what a **Spectator** can do, and can add new records, but with restricted deletion and editing abilities, where he can't update or delete a worker.
    4. **Administrator**: The highest level of access can do anything.
  - **theme**: is the preferred theme that the user is using.
  - **language**: is the preferred language that the user is using.
- **Log**: is the record of the work(Worksheet/Timesheet) that is done by the worker.
  - **date**`*`: is the date that the work was done.
  - **isAbsent**: is a flag that is set to true when the worker is absent.
  - **description**: is the description of the work that was done.
  - **startingTime**: is the time that the work started.
  - **finishingTime**: is the time that the work is finished.
  - **OTV**: is the amount of overtime that the worker worked.
  - **payment**: is the amount of money that the worker got paid.
  - **remarks**: is an optional extra notes about the log.
  - **worker**`*`: is the user/worker who this log is associated with.
- **Payee**: is the person or company that the **Cheque** is made out to.
  - **name**`*`: is the name of the payee.
  - **email**: is the email of the payee.
  - **phoneNumber**: is the phone number of the payee.
  - **remarks**: is an optional extra notes about the payee.
- **Cheque**: is the payment method that is used to pay the **Payee**.
  - **serial**`*`: is the number that is written on the cheque.
  - **dueDate**`*`: is the date that the cheque is due to be cashed.
  - **value**`*`: is the amount that is written on the cheque.
  - **remarks**: is an optional extra notes about the cheque.
  - **payee**: is the payee that the cheque is made out to.
  - **isCancelled**: is a flag that is set to true when the cheque is cancelled.
- **Bill**: is the expenses that are made by the workshop.
  - **date**`*`: is the date that the bill was made.
  - **value**`*`: is the amount that the bill is for.
  - **description**`*`: is the description of the bill.
  - **remarks**: is an optional extra notes about the bill.
- **Session**: is the record of the sessions that are made by the users.
  - **refreshToken**`*`: is the refresh token that is used to generate new access tokens.
  - **user**`*`: is the user that the refresh token is associated with.
  - **expiresAt**`*`: is the date that the refresh token expires.
- `*`Required field
- When a worker gets deleted, all the logs that are associated with that worker are also deleted.
- When a payee gets deleted, all the cheques that are associated with that payee will have its payee set to null.
- When a user logout his refresh token is revoked.

### Restrictions

- User

  - Administrator can't delete himself.
  - Administrator can't deactivate himself.
  - Administrator can't change his own role.
  - Administrator resting a user password revokes all of his refresh tokens.
  - Moderator can't edit or delete any user.

- Log
  - Log worker and date both can't be changed.
  - Log updating or creation can either have a startingTime and a finishingTime, or isAbsent = true. but you can't have both at the same time or none at all.

### Authentication

- The authentication is done using JWT and cookies
  - When the user sign-in he gets a refresh token and an access token, the refresh token is stored in the httpOnly cookies
  - The access token is used to authenticate the user, and the refresh token is used to generate new access tokens.
  - Any request that is made to the server must have the access token in the Authorization header. (Bearer Token)

 ![image](https://github.com/user-attachments/assets/76662ee1-4744-4317-8a39-8a1164d52e2d)


## Used Technologies / Libraries

### Server Side (Back-end)

- Bun
- ExpressJS
- MongoDB
- Mongoose
- BcryptJS
- JsonWebToken
- Cors
- Cookies
- Express Rate Limit

### Client Side (Front-end)

- Bun
- Vite
- React
- Typescript
- Tailwind CSS
- TanStack Query v3 (React Query)
- React Hook Form
- Zod
- Shadcn UI
- i18-next

## Configuration and Setup

- In `/server/config` Fill the `config.env.template` file with the needed information, and rename it to `config.env`
  - `NODE_ENV`: is the environment that the server will run on. [development, production]
  - `DOMAIN_URL`: is the URL of the server (used to set the jwt issuer).
  - `API_PREFIX`: is the prefix of the API routes e.g: /api/v2.
  - `PORT`: is the port that the server will run on.
  - `MONGO_URI`: is the URI of the MongoDB database.
  - Auth: JWT - Cookies
    - `JWT_ACCESS_SECRET`: is the secret that is used to sign the JWT access tokens.
    - `JWT_ACCESS_EXPIRE`: is the expiration time of the JWT access tokens.
    - `JWT_REFRESH_SECRET`: is the secret that is used to sign the JWT refresh tokens.
    - `MAX_AGE`: is the expiration time if the JWT refresh token and the max-age of the cookie.
    - `SECURE_COOKIE`: is a flag that is set to "true" when the cookies are secure.
  - `CLIENT_URL`: is the URL of the client app for cors, use space between multiple URLs.
  - Admin Account: Initial Admin Account, will run only when there are no users in the database at the moment of the server start.
    - `ADMIN_USERNAME`: is the username of the admin account.
    - `ADMIN_PASSWORD`: is the password of the admin account.
    - `ADMIN_EMAIL`: is the email of the admin account.
    - `ADMIN_FIRST_NAME`: is the first name of the admin account.
    - `ADMIN_LAST_NAME`: is the last name of the admin account.
    - `ADMIN_PHONE_NUMBER`: is the phone number of the admin account.
- In `/client/` Fill the `.env.template` file with the needed information and rename it to `.env`
  - `VITE_API_URL`: is the URL of the server and the prefix e.g: https://api.example.com/api/v2.
  - `VITE_APP_TITLE`: is the name of the app, it will be displayed in the title of the page, and different meta tags.
- Run directly on your machine
  - Backend:
    - Run `bun install` to install all the needed dependencies
    - Run `bun run server` to start the server in development mode (--watch)
  - Frontend:
    - Run `bun install` to install all the needed dependencies
    - Run `bun run dev` to start the client in development mode (vite)
    - Run `bun run build` to build the client for production
    - Run `bun run preview` to serve the client in production mode
- Run using docker and docker-compose
  </br>
  Note that you need to have docker and docker-compose installed on your machine
  </br>
  - Run `make compose`
    - Or Run `docker-compose up --build -d` if you don't have "make" installed on your machine.

</br>
</br>
</br>

# API Routes

### Auth

| Method | Route         |
| ------ | ------------- |
| GET    | /auth         |
| POST   | /auth         |
| POST   | /auth/refresh |
| DELETE | /auth/logout  |

### Users

| Method | Route                   |
| ------ | ----------------------- |
| POST   | /users                  |
| GET    | /users?search=&active=  |
| GET    | /users/:userID          |
| PUT    | /users/:userID          |
| DELETE | /users/:userID          |
| POST   | /users/check-username   |
| PATCH  | /users/password         |
| PATCH  | /users/preferences      |
| PATCH  | /users/:userID/password |
| PATCH  | /users/:userID/role     |
| PATCH  | /users/:userID/status   |

### Logs

| Method | Route                     |
| ------ | ------------------------- |
| POST   | /logs                     |
| GET    | /logs?start=&end=&filter= |
| GET    | /logs/:logID              |
| PUT    | /logs/:logID              |
| DELETE | /logs/:logID              |

### Payees

| Method |                  |
| ------ | ---------------- |
| POST   | /payees          |
| GET    | /payees?search=  |
| GET    | /payees/:payeeID |
| PUT    | /payees/:payeeID |
| DELETE | /payees/:payeeID |

### Cheques

| Method | Route                                |
| ------ | ------------------------------------ |
| POST   | /cheques                             |
| GET    | /cheques?start=&end=&filter=&search= |
| GET    | /cheques/:chequeID                   |
| PUT    | /cheques/:chequeID                   |
| DELETE | /cheques/:chequeID                   |

### Bills

| Method | Route                      |
| ------ | -------------------------- |
| POST   | /bills                     |
| GET    | /bills?start=&end=&search= |
| GET    | /bills/:billID             |
| PUT    | /bills/:billID             |
| DELETE | /bills/:billID             |
