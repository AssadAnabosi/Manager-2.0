# Manager 

##### Version: 2.0.0

## Backstory

This app is built upon the need for a database for my family's own workshop, so it was designed to fit the purposes of those needs, at first as a Highschool kid (back in 2018-2019) all I was able to do is a Microsoft Office Access database, and it worked mostly fine for a few years, but the need for a database that can be accessed from different locations by different people started to appear, all of that and the sudden DB file corruption (can't say I didn't expect that the day I designed it on MS Access) made me realize that I need to finally do an upgrade and move it be an Online web app, so Jun. 2022 started working on that with zero background on how to do it, fast forward Dec. 2022 my very first web app, is up and running, and all the old data that survived the corruption have been ported over via a custom app that was specifically created to do this job. I't s double win for me, I learned how to make a Web App Service, and i have a better DB for the workshop.

## Definitions

- **User**: is the **Worker** that is allowed to access the app, and perform the actions that are allowed to them.
    * **firstName***: is the first name of the user.
    * **lastName***: is the last name of the user.
    * **username***: is the username of the user.
    * **email***: is the email of the user.
    * **phoneNumber**: is the phone number of the user.
    * **password***: is the password of the user.
    * **active**: is a flag that is set to decide whether the user is allowed to login or not.
    * **accessLevel**: are the different levels of access that a **Worker** can have, the higher the level the more actions they can perform.
        1. **User**: can only view his own logs and change his password.
        2. **Spectator**: can view all the bills, workers, logs, payees and cheques, but can't edit anything besides his own password.
        3. **Moderator**: can do what a **Spectator** can do, and can add new records, but with restricted deletion and editing abilities, where he can't delete a worker, or update a worker's access level, change the activation status a worker account, or reset a worker's account password.
        4. **Administrator**: Highest level of access can do anything.
- **Log**: is the record of the work that is done by the worker.
    * **date***: is the date that the work was done.
    * **isAbsent**: is a flag that is set to true when the worker is absent.
    * **description**: is the description of the work that was done.
    * **startingTime**: is the time that the work started.
    * **finishingTime**: is the time that the work finished.
    * **OTV**: is the amount of overtime that the worker worked.
    * **payment**: is the amount of money that the worker got paid.
    * **extraNotes**: is an optional extra notes about the work.
    * **worker***: is the worker who this log is associated with.
- **Payee**: is the person or company that the **Cheque** is made out to.
    * **name***: is the name of the payee.
    * **email**: is the email of the payee.
    * **phoneNumber**: is the phone number of the payee.
    * **extraNotes**: is an optional extra notes about the payee.
- **Cheque**: is the payment method that is used to pay the **Payee**.
    * **serial***: is the number that is written on the cheque.
    * **dueDate***: is the date that the cheque is due to be cashed.
    * **value***: is the amount that is written on the cheque.
    * **description**: is an optional description of the cheque.
    * **payee***: is the payee that the cheque is made out to.
    * **isCancelled**: is a flag that is set to true when the cheque is cancelled.
    * **isDeleted**: is a flag that is set to true when the cheque payee is deleted.
- **Bill**: is the expenses that are made by the workshop.
    * **date***: is the date that the bill was made.
    * **value***: is the amount that the bill is for.
    * **description***: is the description of the bill.
    * **extraNotes**: is an optional extra notes about the bill.
- When a worker gets deleted, all the logs that are associated with that worker are also deleted.
- When a payee gets deleted, all the cheques that are associated with that payee are marked as isDeleted = true, and their payee is set to null.

### Restrictions

- User
    * Administrator can't delete himself.
    * Administrator can't deactivate himself.
    * Administrator can't change his own access level.
- Log
    * Log worker and date both can't be changed.
    * Log updating or creation can either have a startingTime and a finishingTime, or isAbsent = true. but you can't have both or neither.
- Cheque
    * Cheque serial number can't be changed.

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
    * ```PORT```: is the port that the server will run on.
    * ```MONGO_URI```: is the URI of the MongoDB database.
    * JWT
        * ```JWT_SECRET```: is the secret that is used to sign the JWT tokens.
        * ```JWT_EXPIRE```: is the expiration time of the JWT tokens.
    * ```CLIENT_URL```: is the URL of the client app for cors.
    * Admin Account: Initial Admin Account, will run only when there are no users in the database at the moment of the server start.
        * ```ADMIN_USERNAME```: is the username of the admin account.
        * ```ADMIN_PASSWORD```: is the password of the admin account.
        * ```ADMIN_EMAIL```: is the email of the admin account.
        * ```ADMIN_FIRST_NAME```: is the first name of the admin account.
        * ```ADMIN_LAST_NAME```: is the last name of the admin account.
        * ```ADMIN_PHONE_NUMBER```: is the phone number of the admin account.
* Run ```npm install``` to install all the needed dependencies
* Run ```npm run server``` to start the server in development mode (nodemon)

</br>
</br>
</br>

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
