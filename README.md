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
