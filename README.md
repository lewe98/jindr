# Integrationsprojekt 2
### JINDR, die Jobbörse für die Hosentasche

> Eine junge Generation von Schülern, Studenten oder Auszubildenden, dabei zu unterstützten einen
  Nebenjob zu finden – Das ist das Ziel von Jindr.
  Als Arbeitssuchender erhält man die Möglichkeit, sich schnell ein aussagekräftiges Profil zu erstellen,
  Interessen zu hinterlegen und anhand derer passende, offene Stellenangebote vorgeschlagen zu
  bekommen. Den registrierten Nebenjobanbietern wird es durch Jindr ermöglicht, passende Jobber,
  abseits der klassischen Massen- und Printmedien, direkt an ihrem Smartphone zu erreichen. Sie
  können selbst aktiv Jobber suchen, sich deren Profile ansehen und mit ihnen in Kontakt treten oder
  sich lediglich selbst suchen lassen.

### Members

* Julian Hermanspahn
* Valentin Laucht
* Lewe Lorenzen
* Pascal Block
* Leo Barnikol

## Live Versions
The staging branch can be found at ``https://jindr-staging.herokuapp.com``

The master branch can be found at ``https://jindr.herokuapp.com``

## Content
* [Tools](#tools)
* [Prerequisites](#prerequisites)
* [Folder Structure](#folder-structure)
* [Pipelines and Deploy](#pipelines-and-deploy)
* [Matching](#matching)

## Tools
Tool | Usage
---------------------|----------
[Ionic](https://ionicframework.com/) | Frontend Development
[Node.js](https://nodejs.org/en/) | Server Development
[Express.js](https://expressjs.com/de/) | Server Development
[Socket.io](https://socket.io/) | Client-Server Communication
[Capacitor](https://capacitor.ionicframework.com/) | Plugins and access to system resources
[AWS S3](https://aws.amazon.com/de/s3/) | Image storage
[MongoDB](https://www.mongodb.com/) | Database
[Mongoose](https://mongoosejs.com/) | MongoDB Framework
[GitLab](https://git.thm.de/) | Version Control
[Heroku](https://heroku.com/) | Hosting Platform
[Jest](https://jestjs.io/) | Server side testing
[MapBox](https://www.mapbox.com/) | Map API


## Prerequisites
Install Ionic CLI:
> npm install -g @ionic/cli

Install dependencies and compile:
>cd server && npm i && npm run tsc  <br>
>cd client && npm i

Install a local MongoDB Client and setup a database <br>
Find ``.env-example`` in server folder and rename to ``.env``.
Paste Path and URI of your MongoDB in ``MONGODB_NAME`` and ``MONGODB_URI``

Navigate to Server folder and run
> npm run start

Navigate to Client folder and run
> ionic serve

## Folder Structure
```bash
├── client
│   ├── interfaces
│   │   ├── *.ts (Classes)
│   ├── src
│   │   ├── app
│   │   │   ├── auth (all pages related to user authentication)
│   │   │   │   ├── auth.module.ts (modules and routing)
│   │   │   ├── landing (landing page)
│   │   │   ├── services (all services)
│   │   │   │   ├── DatabaseController (handles all API requests)
│   │   │   │   ├── storage.ts (handles local storage/ device storage)
│   │   │   ├── shared (all shared components)
│   │   │   ├── shell (shell models)
│   │   │   │   ├── e.g. text-shell (shows loading animation while real data is fetched)
│   │   ├── assets (all assets)
│   │   ├── environments (environment variables)
│   │   ├── sass (globally used sass helper files)
│   ├── package.json (client modules and scripts)
├── server
│   ├── server.ts (Server Script)
│   ├── package.json (Scripts and Modules for Server)
│   ├── .eslintrc (Config for ESLint)
│   ├── .eslintignore (Excluded files for ESLint)
│   ├── test
│   │   ├── database-handler.ts (Initializes Memory Database for tests)
│   │   ├── api.test.ts (Tests for API requests)
│   │   ├── function.test.ts (Tests for Method calls)
│   └── models
│   │   ├── *.ts (Mongoose Schemas)
├── .gitignore
├── .prettierrc (Config for Prettier)
├── jest.config.js (Config for Jest)
├── .env (Environment Variables)
├── .gitlab-ci.yml (Defines Deploy-Pipelines)
├── .package.json (Scripts for Deploy)
├── README.md
```

## Pipelines and Deploy
1. Before you start implementing functionalities, create a branch from ``staging``
and name it after the functionality you are going to implement.
2. Implement the functionality
3. Make sure to write tests and run them (Or write tests first for TDD)!
4. ``cd server && npm run prettier-format && npm run lint && npm run test``
5. Fix possible problems
6. ``cd client && npm run prettier-format && npm run lint && npm run karma && npm run build``
7. Fix possible problems
8. Commit and push and wait for pipelines to finish
9. Once everything is tested and works, make merge request to ``staging``

## Matching
If a User moves to another location or changes his search criteria, the server
must search for jobs to present to the user. To reduce the amount of jobs that need to
be searched on each request, the map will be rasterized. For now, this is only implemented for
Germany, but it's somewhat scalable. 
![Raster explanation](./doku-files/map_raster_doku.png)
This is a simplified Version of a rasterized map of Germany.
<br> The Method ``rasterizeMap`` in ``server.ts`` will
take 2 Points specified by coordinates and a radius to rasterize the map
as shown in the image above.
The Points need to be the south-western and north-eastern point
of a rectangle around the area that needs to be rasterized. The Radius
will be the length of the sides of each tile. The radius should be the same as
the maximal search radius the user can choose in the app.
<br>
The method will then calculate the length of each side of the
outer rectangle and calculate how many tiles of the size of the radius can be build.
<br>
It will return an array of Tiles. Each Tile will look like this:

      public index: number;
      public neighbours: number[];
      public southWest: Coords;
      public northEast: Coords;

The Tile in the south-western corner will have Index 0, the Tile in the north-
eastern corner will have the index ``tiles.length - 1``.
The array ``neighbours`` will store the indexes of each tile next to it.

The Idea behind this is, that jobs don't move in position, once they are created. So if
a job is created, the coordinates of its position will be sent to the server. The server will look up the
correct tile and save its index in the job. 
<br> When a User looks for jobs, his coordinates will be sent to the server, the server will
look up in which tile the user is currently in and will get
all jobs from this tile and all neighboring tiles from the database and check
whether they are in the search radius specified by the user. Since the size of the tiles is the
maximum search radius, it will return all jobs that could possibly be in his radius.
<br> This drastically reduces the amount of jobs that need to be searched on each location change, since it ignores all jobs
that can't possibly be in his radius.
