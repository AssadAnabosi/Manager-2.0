# History

Workbench was formerly called Manager (V1) and Manager-2.0 (V2).

## V1.0

This app is built upon the need for a database for my family's own workshop, so it was designed to fit the purposes of those needs. At first, as a high-school kid (back in 2018-2019), all I was able to do was a Microsoft Office Access database, and it worked mostly fine for a few years. But the need for a database that can be accessed from different locations by different people started to appear. All of that, and the sudden DB file corruption (can't say I didn't expect that the day I designed it on MS Access), made me realize that I needed to finally upgrade and move it to an online web app. So in June 2022 I started working on that with zero background on how to do it. Fast forward to December 2022: my very first web app was up and running, and all the old data that survived the corruption was ported over via a custom app created specifically for that job. It was a double win: I learned how to make a web app service, and I had a better DB for the workshop.

## V2.0 (Manager-2.0)

V1.0 had a lot of issues that were discovered at a later stage: the codebase was not modular or clean, and the UI was anything but responsive, so it was not usable on mobile phones or on any screen that isn't 1920x1080. V2.0 was built again from scratch with responsiveness in mind for the front-end. For the back-end I made sure to have a much cleaner code base, and a more secure one (a better auth system and stricter validations). In short, the second version of the [Manager App](https://github.com/AssadAnabosi/Manager), with a cleaner code base and higher coding standards. It ran on Express and MongoDB.

## Workbench

The project was renamed Workbench and restructured as a Bun monorepo. The Express + MongoDB back-end was replaced by a Cloudflare Worker (Hono + D1), so the whole stack runs on Cloudflare's free plan. See [architecture.md](architecture.md).
