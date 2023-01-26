# Manager 
##### Version: 2.0.0

## Backstory
This app is built upon the need for a database for my family's own workshop, so it was designed to fit the purposes of those needs, at first as a Highschool kid (back in 2018-2019) all I was able to do is a Microsoft Office Access database, and it worked mostly fine for a few years, but the need for a database that can be accessed from different locations by different people started to appear, all of that and the sudden DB file corruption (can't say I didn't expect that the day I designed it on MS Access) made me realize that I need to finally do an upgrade and move it be an Online web app, so Jun. 2022 started working on that with zero background on how to do it, fast forward Dec. 2022 my very first web app, is up and running, and all the old data that survived the corruption have been ported over via a custom app that was specifically created to do this job. I't s double win for me, I learned how to make a Web App Service, and i have a better DB for the workshop.

## Definitions
* **Worker**: is the **User** that is allowed to access the app, and perform the actions that are allowed to them.
* **AccessLevels**: are the different levels of access that a **Worker** can have, the higher the level the more actions they can perform.
    1. **User**: can only view his own logs and change his password.
    2. **Spectator**: can view all the bills, workers, logs, payees and cheques, but can't edit anything besides his own password.
    3. **Moderator**: can do what a **Spectator** can do, and can add new records, but with restricted deletion and editing abilities, where he can't delete a worker, or update a worker's access level, change the activation status a worker account, or reset a worker's account password.
    4. **Administrator**: Highest level of access can do anything.
* When a worker gets deleted, all the logs that are associated with that worker are also deleted.
* When a payee gets deleted, all the cheques that are associated with that payee are marked as isDeleted = true, and their payee is set to null.

## Used Technologies / Libraries
* NodeJS
* ExpressJS
* MongoDB
* Mongoose
* BcryptJS
* JsonWebToken
* Dotenv
* Nodemon

## Configuration and Setup
* Fill the ```config.template.env``` file with the needed information, and rename it to ```config.env```
* Run ```npm install``` to install all the needed dependencies
* Run ```npm run server``` to start the server in development mode (nodemon)


# API Routes

### Auth

| Method |                                   |
|--------|-----------------------------------|
| POST   | /api/auth/register                |
| POST   | /api/auth/login                   |
| GET    | /api/auth/me                      |

### Users

| Method |                                   |
|--------|-----------------------------------|
| GET    | /api/users?search=                |
| GET    | /api/users/:id                    |
| PUT    | /api/users/:id                    |
| DELETE | /api/users/:id                    |
| POST   | /api/users/check-username         |
| PUT    | /api/users/change-password        |
| PUT    | /api/users/reset-password         |
| PUT    | /api/users/access-level           |
| PUT    | /api/users/active-status          |

### Logs

| Method |                                   |
|--------|-----------------------------------|
| POST   | /api/logs                         |
| GET    | /api/logs?start=&end=&search=     |
| GET    | /api/logs/:id                     |
| PUT    | /api/logs/:id                     |
| DELETE | /api/logs/:id                     |

### Payees

| Method |                                   |
|--------|-----------------------------------|
| POST   | /api/payees                       |
| GET    | /api/payees?search=               |
| GET    | /api/payees/:id                   |
| PUT    | /api/payees/:id                   |
| DELETE | /api/payees/:id                   |
### Cheques

| Method |                                   |
|--------|-----------------------------------|
| POST   | /api/cheques                      |
| GET    | /api/cheques?start=&end=&search=  |
| GET    | /api/cheques/:id                  |
| PUT    | /api/cheques/:id                  |
| DELETE | /api/cheques/:id                  |

### Bills

| Method |                                   |
|--------|-----------------------------------|
| POST   | /api/bills                        |
| GET    | /api/bills?start=&end=&search=    |
| GET    | /api/bills/:id                    |
| PUT    | /api/bills/:id                    |
| DELETE | /api/bills/:id                    |
