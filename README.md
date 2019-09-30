# cohort-server

## environment setup
- install node 6.12.3
  - we recommend that you use [nvm](https://github.com/nvm-sh/nvm) to manage your node installed versions
  - use nvm to make node 6.12.3 the active version
- install postgresql [best instructions](https://gist.github.com/ibraheem4/ce5ccd3e4d7a65589ce84f2a3b7c23a3)
- clone repo from github

### database setup
- `npm install`
- `npm install -g knex`
- `createdb cohort`
- `createdb cohort_test`
- `createuser cohort_admin`
- from src/knex: `knex migrate:latest`
- `knex seed:run`

### admin site setup
- from public/admin:
- `yarn install`
- `yarn run dev`

### tests setup
- `npm install -g jest`
- `jest app`

### building the server
- `npx babel src --out-dir lib -w --source-maps --ignore 'src/**/*.test.js'`

### obtaining secret key files
- ask project lead for APN key and dot-env files
- put these in the root folder

### starting the server
- `node lib/cohort-server.js`
