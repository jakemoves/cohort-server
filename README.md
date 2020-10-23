# Cohort Server
[Cohort](https://cohort.rocks) is a code toolkit that makes it easier for performing artists and producers to integrate smartphones and tablets in their works.

This repository contains two major components in that toolkit: a server, and an admin site. The server (aka Cohort Server) holds information about productions, performances, and connected mobile devices. The admin site allows users to create and modify productions and performances (we call them events and occasions), and to trigger audio, video, and other cues on connected devices.

You can try out Cohort without reading further here, by going to our (Getting Started)[https://cohort.rocks/getting-started] page.

The rest of this README is aimed at people who want to run their own Cohort server. 

## Getting started
### environment setup
- install node 12.19.0
  - we recommend that you use [nvm](https://github.com/nvm-sh/nvm) to manage your node installed versions
  - use nvm to make node 12.19.0 the active version
  - as different versions of node may be present on your machine, we suggest running `nvm list` to confirm 12.19.0 is the active version (indicated in green)
  - if not on 12.19.0, run `nvm use 12.19.0`
- install postgresql ([best instructions](https://gist.github.com/ibraheem4/ce5ccd3e4d7a65589ce84f2a3b7c23a3))
- clone repo from github

### database setup
- ensure postgresql is running as a service (`pg_ctl -D /usr/local/var/postgres start`, or if you installed with Homebrew, `brew services start postgresql`)
- `npm install`
- `npm install -g knex`
- `createdb cohort`
- `createdb cohort_test`
- `createuser cohort_admin`
- from `src/knex` : `npx knex migrate:latest`
- from `src/knex` : `npx knex seed:run`

### admin site setup

Getting started:
- `yarn install`
- `yarn run dev` starts up the site locally at [localhost:5000](http://localhost:5000) using a hot-refresh dev server

Building for production:
- from `/admin-site` : `yarn run build && cp public/* ../public/admin-v2` 
- if you have a cohort server running locally, the admin site is served at [localhost:3000/admin-v2](http://localhost:3000/admin-v2/)

### tests setup
- `npm install -g jest`
- `jest app && jest websocket` (the '&&' forces these to run one after the other, they fail if run in parallel which is what happen if you just run `jest`)

### obtaining secret key files
- ask project lead for the dot-env file, or generate a JWT key and add it to a .env file with the entry name 'JWT_SECRET' (e.g. `JWT_SECRET=[your generated key]`)
- put this .env file in the root folder

### building the server
- `npm install`
- `npm run build`

### building the admin site
- if you haven't already: `cd admin-site && yarn install && cd ..`
- `npm run build-admin-site` will build the admin site and copy it to /public/admin
- the admin site is served at /admin

### starting the server
- `node lib/cohort-server.js`
- you should see:
```
preparing notification service using 'development' environment
starting cohort server...
   environment: development
   http server started on port 3000
   websocket server started
event midway is now open
event fluxdelux is now open
   cohort session started
   mailer service started
```

### using VS Code for development
This repo includes a workspace for Visual Studio Code. The workspace is set up with launch and build scripts.
