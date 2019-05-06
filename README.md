# cohort-server

## environment setup
- install node (recommend that you use nvm to manage your node installation)
- install postgresql (https://gist.github.com/ibraheem4/ce5ccd3e4d7a65589ce84f2a3b7c23a3)
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

