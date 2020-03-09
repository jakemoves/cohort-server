# Cohort Server

## Getting started
- a packaged version of this app that runs on a local (offline) network can be downloaded [here](https://cohort.rocks/binaries/cohort-server-offline-latest.zip)

### environment setup
- install node 8.16.0
  - we recommend that you use [nvm](https://github.com/nvm-sh/nvm) to manage your node installed versions
  - use nvm to make node 8.16.0 the active version
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

### building the server
- `npm install`
- `npm build`

### building all the things
This script builds all components (server, admin site, blog) and copies the built admin site and blog to the correct folders under /public.
- `npm install` (if you're doing this immediately after pulling changes)
- `npm run build-all`

### obtaining secret key files
- ask project lead for the dot-env file
- put this in the root folder

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
